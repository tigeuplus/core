"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const Cobweb_1 = require("../Cobweb");
const ws_1 = require("ws");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const elliptic_1 = require("elliptic");
const Command_1 = require("./Command");
const node_schedule_1 = require("node-schedule");
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
}
function parse(data) {
    return JSON.parse(data, (key, value) => {
        if (typeof value === 'string' && /^\d+n$/.test(value))
            return BigInt(value.slice(0, value.length - 1));
        return value;
    });
}
/**
 * 지갑
 *
 * @since v1.0.0-alpha
 * @param storage 저장 경로
 * @param timeout 타임아웃
 * @param port 포트
 * @param url 기존 피어 주소
 */
class Wallet {
    /**
     * 주소
     */
    address;
    /**
     * 개인키
     */
    privatekey;
    /**
     * 잔액
     */
    balance;
    /**
     * 코브웹
     */
    cobweb;
    /**
     * 웹소켓 서버
     */
    server;
    /**
     * 피어
     */
    peers;
    /**
     * 마지막으로 검증된 거래
     */
    omegas;
    /**
     * 저장 경로
     */
    storage;
    /**
     * 타임아웃
     */
    timeout;
    constructor(
    /**
     * 저장 경로
     */
    storage, 
    /**
     * 타임아웃
     */
    timeout = 1000, 
    /**
     * 포트
     */
    port = 6000, 
    /**
     * 주소
     */
    url) {
        this.storage = storage;
        this.timeout = timeout;
        this.server = new ws_1.Server({ port: port });
        this.peers = {};
        this.balance = 0n;
        this.cobweb = new Cobweb_1.Cobweb();
        this.omegas = [];
        (0, fs_1.mkdirSync)(path.join(this.storage, 'wallet'));
        (0, fs_1.mkdirSync)(path.join(this.storage, 'transactions'));
        (0, fs_1.mkdirSync)(path.join(this.storage, 'snapshots'));
        if ((0, fs_1.existsSync)(path.join(this.storage, 'wallet', '.key'))) {
            this.privatekey = (0, fs_1.readFileSync)(path.join(this.storage, 'wallet', '.key'), { encoding: 'utf8' });
            this.address = new elliptic_1.ec('secp256k1').keyFromPrivate(this.privatekey, 'hex').getPublic('hex');
        }
        else {
            let EC = new elliptic_1.ec('secp256k1').genKeyPair();
            this.privatekey = EC.getPrivate('hex');
            this.address = EC.getPublic('hex');
            (0, fs_1.writeFileSync)(path.join(this.storage, 'wallet', '.key'), this.privatekey, { encoding: 'utf8' });
        }
        this.server.on('connection', async (websocket, request) => this.onConnection(websocket, request));
        if (url) {
            let websocket = new ws_1.WebSocket(url);
            websocket.on('open', async () => this.init(websocket, url));
        }
        else {
            let transfer = new Cobweb_1.Transfer('', this.address, 1000000000000n);
            let transaction = new Cobweb_1.Transaction('', [transfer], ['', '']);
            this.cobweb.add(transaction);
            this.omegas = [transaction.hash, transaction.hash];
        }
        (0, node_schedule_1.scheduleJob)('3 * * * * *', async () => {
            let spiders = (0, Cobweb_1.anyToSpiders)(parse(stringify(this.cobweb.spiders)));
            for (let i = 0; Object.keys(spiders).length; i++)
                if (spiders[Object.keys(spiders)[i]].spiders.length >= 100) {
                    for (let j = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j++) {
                        delete this.cobweb.spiders[Object.keys(spiders)[i]];
                        if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length === 0)
                            delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].spiders[j]];
                        else
                            for (let k = 0; k < spiders[Object.keys(spiders)[i]].spiders.length; k++)
                                if (spiders[Object.keys(spiders)[i]].spiders[k] !== spiders[Object.keys(spiders)[i]].spiders[j])
                                    if ((spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length - spiders[spiders[Object.keys(spiders)[i]].spiders[k]].spiders.length) >= 10) {
                                        delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].spiders[j]];
                                        break;
                                    }
                    }
                    let save = false;
                    for (let j = 0; j < spiders[Object.keys(spiders)[i]].transaction.transfers.length; j++) {
                        let from = spiders[Object.keys(spiders)[i]].transaction.transfers[j].from;
                        let to = spiders[Object.keys(spiders)[i]].transaction.transfers[j].to;
                        let balanceOfFrom = this.getBalance(from);
                        let balanceOfTo = this.getBalance(to);
                        let value = spiders[Object.keys(spiders)[i]].transaction.transfers[j].value;
                        if ((balanceOfFrom - value) === 0n)
                            this.deleteBalance(from);
                        else
                            this.saveBalance(from, (balanceOfFrom - value));
                        this.saveBalance(to, (balanceOfTo + value));
                        if (from === this.address || to === this.address)
                            save = true;
                    }
                    if (save)
                        (0, fs_1.writeFileSync)(path.join(__dirname, 'wallet', 'transactions', `${spiders[Object.keys(spiders)[i]].transaction.hash}}.json`), stringify(spiders[Object.keys(spiders)[i]].transaction), { encoding: 'utf8' });
                    delete this.cobweb.spiders[Object.keys(spiders)[i]];
                }
        });
    }
    deleteBalance(address) {
        try {
            (0, fs_1.unlinkSync)(path.join(this.storage, 'snapshots', `${address}.json`));
        }
        catch (error) { }
    }
    saveBalance(address, balance) {
        (0, fs_1.writeFileSync)(path.join(this.storage, 'snapshots', `${address}.json`), stringify(balance), { encoding: 'utf8' });
    }
    /**
     * 잔액을 가져옵니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     * @returns bigint
     */
    getBalance(
    /**
     * 주소
     */
    address) {
        try {
            return parse(stringify((0, fs_1.readFileSync)(path.join(this.storage, 'snapshots', `${address}.json`), { encoding: 'utf8' })));
        }
        catch (erro) { }
        return 0n;
    }
    /**
     * 전송합니다
     *
     * @since v1.0.0-alpha
     * @param transfers 전송 데이터
     */
    send(
    /**
     * 전송 데이터
     */
    transfers) {
        let transaction = new Cobweb_1.Transaction(transfers[0].from, transfers, this.calculateTargetSpider());
        transaction = new Cobweb_1.Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, transaction.nonce, transaction.hash);
        this.broadcast(stringify(new Command_1.Command('Add_Transaction', transaction)));
    }
    /**
     * 모든 피어에게 데이터를 전송합니다
     *
     * @since v1.0.0-alpha
     * @param message 데이터
     */
    broadcast(
    /**
     * 메시지
     */
    message) {
        for (let i = 0; i < Object.keys(this.peers).length; i++)
            this.peers[Object.keys(this.peers)[i]].websocket.send(message);
    }
    /**
     * 대상 스파이더를 계산합니댜
     *
     * @since v1.0.0-alpha
     * @returns string[]
     */
    calculateTargetSpider() {
        let hash = this.omegas[Math.floor(Math.random() * this.omegas.length)];
        if (!this.cobweb.spiders[hash])
            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)];
        let spider = this.cobweb.spiders[hash];
        let targets = [{}, {}];
        for (;;) {
            let valid = false;
            for (let i = 0; i < spider.transaction.targets.length; i++)
                if (this.cobweb.spiders[spider.transaction.targets[i]])
                    if (this.isTransactionValid(this.cobweb.spiders[spider.transaction.targets[i]].transaction, true)) {
                        valid = true;
                        break;
                    }
            if (valid) {
                valid = false;
                for (let i = 0; i < spider.spiders.length; i++)
                    if (this.cobweb.spiders[spider.spiders[i]])
                        if (this.isTransactionValid(this.cobweb.spiders[spider.spiders[i]].transaction, true)) {
                            valid = true;
                            break;
                        }
                if (valid)
                    break;
            }
            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)];
            spider = this.cobweb.spiders[hash];
        }
        for (let i = 0; i < 100; i++)
            for (let j = 0; j < targets.length; j++)
                for (;;) {
                    let k = undefined;
                    if ((j === 0 && spider.transaction.targets.length !== 0) || (j === 1 && spider.spiders.length === 0))
                        k = spider.transaction.targets[Math.floor(Math.random() * spider.transaction.targets.length)];
                    else
                        k = spider.spiders[Math.floor(Math.random() * spider.spiders.length)];
                    if (!k) {
                        targets[j][hash] = (targets[j][hash] || 0) + 1;
                        break;
                    }
                    if (this.cobweb.spiders[k])
                        if (this.isTransactionValid(this.cobweb.spiders[k].transaction, true)) {
                            targets[j][k] = (targets[j][k] || 0) + 1;
                            break;
                        }
                }
        let results = [];
        for (let i = 0; i < 2; i++)
            results.push(Object.keys(targets[i]).sort((a, b) => targets[i][b] - targets[i][a])[0]);
        return results;
    }
    // /**
    //  * 대상 거래를 계산합니다
    //  * 
    //  * @since v1.0.0-alpha
    //  * @returns [ string, string ]
    //  */
    // public calculateTargetTransaction(): [ string, string ]
    // {
    //     let spiders: [ { [ index: string ]: number }, { [ index: string ]: number } ] = [ {}, {} ]
    //     for (let i: number = 0; i < 2; i ++)
    //     {
    //         let spider: Spider | undefined = this.cobweb.spiders[this.omegas[i]]
    //         if (spider)
    //             for (let j: number = 0; j < 100; j ++)
    //             {
    //                 for (;;)
    //                 {
    //                     let k: number = Math.floor(Math.random() * spider.transaction.targets.length)
    //                     if (this.cobweb.spiders[spider.spiders[k]])
    //                         if (this.isTransactionValid(this.cobweb.spiders[spider.spiders[k]].transaction))
    //                         {
    //                             spiders[0][spider.spiders[k]] = (spiders[0][spider.spiders[k]] || 0) + 1
    //                             break
    //                         }
    //                 }
    //                 for (;;)
    //                 {
    //                     let k: number = Math.floor(Math.random() * spider.spiders.length)
    //                     if (this.cobweb.spiders[spider.spiders[k]])
    //                         if (this.isTransactionValid(this.cobweb.spiders[spider.spiders[k]].transaction))
    //                         {
    //                             spiders[1][spider.spiders[k]] = (spiders[1][spider.spiders[k]] || 0) + 1
    //                             break
    //                         }
    //                 }
    //             }
    //     }
    //     let ascending: [ string[], string[] ] = [ Object.keys(spiders[0]).sort((a: string, b: string) => spiders[0][b] - spiders[0][a]), Object.keys(spiders[1]).sort((a: string, b: string) => spiders[1][b] - spiders[1][a])]
    //     return [ ascending[0][0], ascending[1][0] ]
    // }
    async onConnection(websocket, request) {
        websocket.on('close', () => this.onClose(request.headers.host));
        websocket.on('message', async (data) => this.onMessage(websocket, `ws://${request.headers.host}`, parse(data.toString('utf8'))));
    }
    async onMessage(websocket, url, data) {
        let command = (0, Command_1.anyToCommand)(data);
        if (command)
            switch (command.name) {
                case 'Add_Peer':
                    if (typeof command.data === 'string')
                        if (!this.peers[url])
                            this.peers[url] = { websocket: websocket, address: command.data };
                    break;
                case 'Get_Peers':
                    let peers = {};
                    for (let i = 0; i < Object.keys(this.peers).length; i++)
                        peers[Object.keys(this.peers)[i]] = this.peers[Object.keys(this.peers)[i]].address;
                    return websocket.send(stringify(new Command_1.Command('Get_Peers_Result', peers)));
                case 'Get_Balances':
                    let balances = {};
                    let files = (0, fs_1.readdirSync)(path.join(this.storage, 'balances'));
                    for (let i = 0; i < files.length; i++)
                        balances[files[i].split('.')[0]] = parse((0, fs_1.readFileSync)(path.join(this.storage, 'balances', files[i]), { encoding: 'utf8' }));
                    return websocket.send(stringify(new Command_1.Command('Get_Balances_Result', balances)));
                case 'Add_Transaction':
                    let transaction = (0, Cobweb_1.anyToTransaction)(command.data);
                    if (transaction)
                        if (this.isTransactionTypeValid(transaction)) {
                            this.cobweb.add(transaction);
                            this.omegas = transaction.targets;
                        }
                    break;
                case 'Get_omegas':
                    return websocket.send(stringify(new Command_1.Command('Get_omegas_Result', this.omegas)));
            }
    }
    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    isTransactionTypeValid(
    /**
     * 거래
     */
    transaction) {
        for (let i = 0; i < transaction.targets.length; i++)
            if (!this.cobweb.spiders[transaction.targets[i]])
                return false;
        return (0, Cobweb_1.isTransactionValid)(transaction);
    }
    /**
     * 거래를 검증합니다
     *
     * @since v1.0.0-alpha.2
     * @param transaction 거래
     * @param spider 기존 스파이더 여부
     * @returns boolean
     */
    isTransactionValid(
    /**
     * 거래
     */
    transaction, 
    /**
     * 스파이더 여부
     */
    spider = false) {
        if (spider)
            for (let i = 0; i < transaction.targets.length; i++) {
                let t = this.cobweb.spiders[transaction.targets[i]]?.transaction;
                if (t)
                    if (!this.isTransactionValid(t, true))
                        return false;
            }
        else
            for (let i = 0; i < transaction.targets.length; i++) {
                let t = this.cobweb.spiders[transaction.targets[i]]?.transaction;
                if (!t)
                    return false;
                else if (!this.isTransactionValid(t, true))
                    return false;
            }
        return (0, Cobweb_1.isTransactionValid)(transaction);
    }
    onClose(url) {
        if (this.peers[url])
            delete this.peers[url];
    }
    async init(websocket, url) {
        let peers = await this.getPeers(websocket);
        if (!peers)
            throw new Error();
        await this.addPeer(websocket, url, peers);
        let spiders = await this.getSpiders(websocket);
        if (!spiders)
            throw new Error();
        this.cobweb = new Cobweb_1.Cobweb(spiders);
        let balances = await this.getBalances(websocket);
        if (!balances)
            throw new Error();
        for (let i = 0; i < Object.keys(balances).length; i++) {
            if (Object.keys(balances)[i] === this.address)
                this.balance = balances[Object.keys(balances)[i]];
            (0, fs_1.writeFileSync)(path.join(this.storage, 'balances', `${Object.keys(balances)[i]}.json`), stringify(balances[Object.keys(balances)[i]]), { encoding: 'utf8' });
        }
    }
    getomegas(websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                let omegas;
                let command = (0, Command_1.anyToCommand)(message);
                if (command)
                    switch (command.name) {
                        case 'Get_omegas_Result':
                            if (command.data instanceof Array)
                                if (command.data.length === 2) {
                                    let succes = true;
                                    for (let i = 0; i < command.data.length; i++)
                                        if (typeof command.data[i] !== 'string') {
                                            succes = false;
                                            break;
                                        }
                                    if (succes)
                                        omegas = [command.data[0], command.data[1]];
                                }
                    }
                if (stop)
                    return resolve();
                if (omegas)
                    return resolve(omegas);
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_omegas')));
        });
    }
    getBalances(websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                let balances;
                let command = (0, Command_1.anyToCommand)(message);
                if (command)
                    switch (command.name) {
                        case 'Get_Balances_Result':
                            if (command.data instanceof Object) {
                                let success = true;
                                for (let i = 0; i < Object.keys(command.data).length; i++)
                                    if (typeof command.data[Object.keys(command.data)[i]] !== 'bigint') {
                                        success = false;
                                        break;
                                    }
                                if (success)
                                    balances = command.data;
                            }
                            break;
                    }
                if (balances)
                    return resolve(balances);
                if (stop)
                    return resolve();
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Balances')));
        });
    }
    getSpiders(websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                let spiders;
                let command = (0, Command_1.anyToCommand)(message);
                if (command)
                    switch (command.name) {
                        case 'Get_Spiders_Result':
                            if (command.data instanceof Object) {
                                let success = true;
                                for (let i = 0; i < Object.keys(command.data).length; i++)
                                    if (!(0, Cobweb_1.isSpiderTypeValid)(command.data[Object.keys(command.data)[i]])) {
                                        success = false;
                                        break;
                                    }
                                if (success)
                                    spiders = command.data;
                            }
                            break;
                    }
                if (spiders)
                    return resolve(spiders);
                if (stop)
                    return resolve();
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Spiders', this.address)));
        });
    }
    addPeer(websocket, url, peers) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < Object.keys(peers).length; i++)
                if (Object.keys(peers)[i] === url)
                    this.peers[Object.keys(peers)[i]] = { websocket: websocket, address: peers[Object.keys(peers)[i]] };
                else {
                    let ws = new ws_1.WebSocket(Object.keys(peers)[i]);
                    ws.send(stringify(new Command_1.Command('Add_Peer')));
                    this.peers[Object.keys(peers)[i]] = { websocket: ws, address: peers[Object.keys(peers)[i]] };
                }
        });
    }
    getPeers(websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                let peers;
                let command = (0, Command_1.anyToCommand)(message);
                if (command)
                    switch (command.name) {
                        case 'Get_Peers_Result':
                            if (command.data instanceof Object) {
                                let success = true;
                                for (let i = 0; i < Object.keys(command.data).length; i++)
                                    if (typeof command.data[Object.keys(command.data)[i]] !== 'string') {
                                        success = false;
                                        break;
                                    }
                                if (success)
                                    peers = command.data;
                            }
                            break;
                    }
                if (peers)
                    return resolve(peers);
                if (stop)
                    return resolve();
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Peers')));
        });
    }
}
exports.Wallet = Wallet;
__exportStar(require("./Command"), exports);
//# sourceMappingURL=index.js.map
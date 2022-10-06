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
    timeout, 
    /**
     * 포트
     */
    port, 
    /**
     * 주소
     */
    url) {
        this.storage = storage;
        this.timeout = timeout;
        this.server = new ws_1.Server({ port: (port || 6001) });
        this.peers = {};
        this.balance = 0n;
        this.cobweb = new Cobweb_1.Cobweb();
        try {
            this.privatekey = (0, fs_1.readFileSync)(path.join(this.storage, 'wallet', '.key'), { encoding: 'utf8' });
            this.address = new elliptic_1.ec('secp256k1').keyFromPrivate(this.privatekey, 'hex').getPublic('hex');
        }
        catch (error) {
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
        (0, node_schedule_1.scheduleJob)('3 * * * * *', async () => {
            let spiders = (0, Cobweb_1.anyToSpiders)(parse(stringify(this.cobweb.spiders)));
            for (let i = 0; Object.keys(spiders).length; i++)
                if (spiders[Object.keys(spiders)[i]].targets.length >= 100) {
                    for (let j = 0; j < spiders[Object.keys(spiders)[i]].targets.length; j++) {
                        delete this.cobweb.spiders[Object.keys(spiders)[i]];
                        if (spiders[spiders[Object.keys(spiders)[i]].targets[j]].targets.length === 0)
                            delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].targets[j]];
                        else
                            for (let k = 0; k < spiders[Object.keys(spiders)[i]].targets.length; k++)
                                if (spiders[Object.keys(spiders)[i]].targets[k] !== spiders[Object.keys(spiders)[i]].targets[j])
                                    if ((spiders[spiders[Object.keys(spiders)[i]].targets[j]].targets.length - spiders[spiders[Object.keys(spiders)[i]].targets[k]].targets.length) >= 10) {
                                        delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].targets[j]];
                                        break;
                                    }
                    }
                    delete this.cobweb.spiders[Object.keys(spiders)[i]];
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
                    }
                }
        });
    }
    /**
     * 잔액을 삭제합니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     */
    deleteBalance(
    /**
     * 주소
     */
    address) {
        try {
            (0, fs_1.unlinkSync)(path.join(this.storage, 'snapshots', `${address}.json`));
        }
        catch (error) { }
    }
    /**
     * 잔액을 저장합니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     * @param balance 잔액
     */
    saveBalance(
    /**
     * 주소
     */
    address, 
    /**
     * 잔액
     */
    balance) {
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
        this.broadcast(stringify(new Command_1.Command('Add_Transaction', new Cobweb_1.Transaction(this.address, transfers, this.calculateTargetTransaction()))));
    }
    /**
     * 모든 피어에게 데이터를 전송합니다
     *
     * @since v1.0.0-alpha
     * @param message 데이터
     */
    broadcast(message) {
        for (let i = 0; i < Object.keys(this.peers).length; i++)
            this.peers[Object.keys(this.peers)[i]].websocket.send(message);
    }
    /**
     * 대상 거래를 계산합니다
     *
     * @since v1.0.0-alpha
     * @returns [ string, string ]
     */
    calculateTargetTransaction() {
        let spiders = {};
        for (let i = 0; i < 100; i++) {
            let hash = Object.keys(this.cobweb.spiders).sort((a, b) => this.cobweb.spiders[b].targets.length - this.cobweb.spiders[a].targets.length);
            let candidates = [[], []];
            candidates[1] = hash;
            for (let j = 0; j < (Math.floor(hash.length / 9) + 1); j++)
                candidates[0][j] = hash[j];
            let transactions = [];
            for (; transactions.length === 1;) {
                let j = Math.floor(Math.random() * candidates[Math.min(transactions.length, 1)].length);
                if ((0, Cobweb_1.isTransactionValid)(this.cobweb.spiders[candidates[Math.min(transactions.length, 1)][j]].transaction))
                    transactions.push(candidates[Math.min(transactions.length, 1)][i]);
            }
            for (let j = 0; j < transactions.length; j++)
                if (spiders[transactions[j]])
                    spiders[transactions[j]] += 1;
                else
                    spiders[transactions[j]] = 1;
        }
        let ascending = Object.keys(spiders).sort((a, b) => spiders[b] - spiders[a]);
        return [ascending[0], ascending[1]];
    }
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
                        if (this.isTransactionTypeValid(transaction))
                            this.cobweb.add(transaction);
                    break;
            }
    }
    isTransactionTypeValid(transaction) {
        for (let i = 0; i < transaction.targets.length; i++)
            if (!this.cobweb.spiders[transaction.targets[i]])
                return false;
        return (0, Cobweb_1.isTransactionValid)(transaction);
    }
    isTransactionValid(transaction, spider = false) {
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
    /**
     * 모든 잔액을 가져옵니다
     *
     * @since v1.0.0-alpha
     * @param websocket
     * @returns Promise<{ [ index: string ]: bigint } | undefined>
     */
    getBalances(
    /**
     * 웹소켓
     */
    websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                if (stop)
                    return resolve();
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
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Balances')));
        });
    }
    /**
     * 모든 스파이더를 가져옵니댜
     *
     * @since v1.0.0-alpha
     * @param websocket
     * @returns Promise<{ [ index: string ]: Spider} | undefined>
     */
    getSpiders(
    /**
     * 웹소켓
     */
    websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                if (stop)
                    return resolve();
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
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Spiders', this.address)));
        });
    }
    /**
     * 피어를 추가합니다
     *
     * @since v1.0.0-alpha
     * @param websocket 웹소켓
     * @param url 주소
     * @param peers 피어 리스트
     */
    addPeer(
    /**
     * 웹소켓
     */
    websocket, 
    /**
     * 주소
     */
    url, 
    /**
     * 피어 리스트
     */
    peers) {
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
    /**
     * 모든 피어를 가져갑니다
     *
     * @since v1.0.0-alpha
     * @param websocket 웹소켓
     * @returns Promise<{ [ index: string ]: string | undefined }>
     */
    getPeers(
    /**
     * 웹소켓
     */
    websocket) {
        return new Promise((resolve, reject) => {
            let stop = false;
            let timeout = setTimeout(() => {
                stop = true;
            }, this.timeout);
            let onMessage = ((message) => {
                if (stop)
                    return resolve();
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
                websocket.once('message', onMessage);
            });
            websocket.once('message', onMessage);
            websocket.send(stringify(new Command_1.Command('Get_Peers')));
        });
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=index.js.map
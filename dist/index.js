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
exports.Node = void 0;
const class_1 = require("@tigeuplus/class");
const ws_1 = require("ws");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const elliptic_1 = require("elliptic");
const node_schedule_1 = require("node-schedule");
const utility_1 = require("@tigeuplus/utility");
const Get_1 = require("./Get");
const Save_1 = require("./Save");
const Delete_1 = require("./Delete");
/**
 * 노드
 *
 * @since v1.0.0
 * @param storage 저장 경로
 * @param timeout 타임아웃
 * @param port 포트
 * @param url 기존 피어 주소
 */
class Node {
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
    /**
     * 삭제된 거래
     */
    deleted;
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
        this.cobweb = new class_1.Cobweb();
        this.omegas = [];
        this.deleted = [];
        if (!(0, fs_1.existsSync)(path.join(this.storage, 'wallet')))
            (0, fs_1.mkdirSync)(path.join(this.storage, 'wallet'));
        if (!(0, fs_1.existsSync)(path.join(this.storage, 'transactions')))
            (0, fs_1.mkdirSync)(path.join(this.storage, 'transactions'));
        if (!(0, fs_1.existsSync)(path.join(this.storage, 'balances')))
            (0, fs_1.mkdirSync)(path.join(this.storage, 'balances'));
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
            let transfer = new class_1.Transfer('', this.address, 1000000000000n);
            let transaction = new class_1.Transaction('', [transfer], ['', '']);
            this.cobweb.add(transaction);
            this.omegas = [transaction.hash, transaction.hash];
        }
        (0, node_schedule_1.scheduleJob)('3 * * * * *', async () => {
            this.deleted = [];
            let spiders = (0, class_1.anyToSpiders)(utility_1.Json.parse(utility_1.Json.stringify(this.cobweb.spiders)));
            for (let i = 0; Object.keys(spiders).length; i++)
                if (spiders[Object.keys(spiders)[i]].spiders.length >= 100) {
                    let sum = 0;
                    for (let j = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j++)
                        if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]])
                            sum += spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length;
                    if (sum >= 200) {
                        for (let j = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j++)
                            if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]])
                                for (let k = 0; spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets.length; k++)
                                    if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets[k] !== Object.keys(spiders)[j])
                                        if (!spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets[k]])
                                            if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length === 0) {
                                                this.deleted.push(spiders[Object.keys(spiders)[i]].spiders[j]);
                                                setTimeout(() => {
                                                    for (let i = 0; i < this.deleted.length; i++)
                                                        if (this.deleted[i] === spiders[Object.keys(spiders)[i]].spiders[j])
                                                            delete this.deleted[i];
                                                }, 60 * 5 * 1000);
                                                delete spiders[spiders[Object.keys(spiders)[i]].spiders[j]];
                                            }
                                            else
                                                for (let l = 0; l < spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length; l++)
                                                    if (spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders[l]])
                                                        if (spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders[l]].spiders.length >= spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length) {
                                                            this.deleted.push(spiders[Object.keys(spiders)[i]].spiders[j]);
                                                            setTimeout(() => {
                                                                for (let i = 0; i < this.deleted.length; i++)
                                                                    if (this.deleted[i] === spiders[Object.keys(spiders)[i]].spiders[j])
                                                                        delete this.deleted[i];
                                                            }, 60 * 5 * 1000);
                                                            delete spiders[spiders[Object.keys(spiders)[i]].spiders[j]];
                                                            break;
                                                        }
                        let save = false;
                        for (let j = 0; j < spiders[Object.keys(spiders)[i]].transaction.transfers.length; j++) {
                            let from = spiders[Object.keys(spiders)[i]].transaction.transfers[j].from;
                            let to = spiders[Object.keys(spiders)[i]].transaction.transfers[j].to;
                            let balanceOfFrom = (0, Get_1.getBalance)(from, this.storage);
                            let balanceOfTo = (0, Get_1.getBalance)(to, this.storage);
                            let value = spiders[Object.keys(spiders)[i]].transaction.transfers[j].value;
                            if ((balanceOfFrom - value) === 0n)
                                (0, Delete_1.deleteBalance)(from, this.storage);
                            else
                                (0, Save_1.saveBalance)(from, (balanceOfFrom - value), this.storage);
                            (0, Save_1.saveBalance)(to, (balanceOfTo + value), this.storage);
                            if (from === this.address || to === this.address)
                                save = true;
                        }
                        if (save)
                            (0, fs_1.writeFileSync)(path.join(__dirname, 'wallet', 'transactions', `${spiders[Object.keys(spiders)[i]].transaction.hash}}.json`), utility_1.Json.stringify(spiders[Object.keys(spiders)[i]].transaction), { encoding: 'utf8' });
                    }
                    this.deleted.push(Object.keys(spiders)[i]);
                    setTimeout(() => {
                        for (let i = 0; i < this.deleted.length; i++)
                            if (this.deleted[i] === Object.keys(spiders)[i])
                                delete this.deleted[i];
                    }, 60 * 5 * 1000);
                    delete this.cobweb.spiders[Object.keys(spiders)[i]];
                }
        });
    }
    /**
     * 전송합니다
     *
     * @since v1.0.0
     * @param transfers 전송 데이터
     */
    send(
    /**
     * 전송 데이터
     */
    transfers) {
        let transaction = new class_1.Transaction(transfers[0].from, transfers, this.calculateTargetSpiders());
        transaction = new class_1.Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, transaction.nonce, transaction.hash);
        if (this.isTransactionValid(transaction)) {
            this.cobweb.add(transaction);
            this.omegas = transaction.targets;
            this.broadcast(utility_1.Json.stringify(new class_1.Command('Add_Transaction', transaction)));
        }
    }
    /**
     * 모든 피어에게 데이터를 전송합니다
     *
     * @since v1.0.0
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
     * @since v1.0.0
     * @returns string[]
     */
    calculateTargetSpiders() {
        let hash = this.omegas[Math.floor(Math.random() * this.omegas.length)];
        if (!this.cobweb.spiders[hash])
            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)];
        let spider = this.cobweb.spiders[hash];
        let targets = [{}, {}];
        for (;;) {
            if (this.isSpiderValid(spider)) {
                let valid = false;
                for (let i = 0; i < spider.transaction.targets.length; i++)
                    if (this.cobweb.spiders[spider.transaction.targets[i]])
                        if (this.isSpiderValid(this.cobweb.spiders[spider.transaction.targets[i]])) {
                            valid = true;
                            break;
                        }
                if (valid) {
                    valid = false;
                    for (let i = 0; i < spider.spiders.length; i++)
                        if (this.cobweb.spiders[spider.spiders[i]])
                            if (this.isSpiderValid(this.cobweb.spiders[spider.spiders[i]])) {
                                valid = true;
                                break;
                            }
                    if (valid)
                        break;
                }
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
                        if (this.isSpiderValid(this.cobweb.spiders[k])) {
                            targets[j][k] = (targets[j][k] || 0) + 1;
                            break;
                        }
                }
        let results = [];
        for (let i = 0; i < 2; i++)
            results.push(Object.keys(targets[i]).sort((a, b) => targets[i][b] - targets[i][a])[0]);
        return results;
    }
    async onConnection(websocket, request) {
        websocket.on('close', () => this.onClose(request.headers.host));
        websocket.on('message', async (data) => this.onMessage(websocket, `ws://${request.headers.host}`, utility_1.Json.parse(data.toString('utf8'))));
    }
    async onMessage(websocket, url, data) {
        let command = (0, class_1.anyToCommand)(data);
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
                    return websocket.send(utility_1.Json.stringify(new class_1.Command('Get_Peers_Result', peers)));
                case 'Get_Balances':
                    let balances = {};
                    let files = (0, fs_1.readdirSync)(path.join(this.storage, 'balances'));
                    for (let i = 0; i < files.length; i++)
                        balances[files[i].split('.')[0]] = utility_1.Json.parse((0, fs_1.readFileSync)(path.join(this.storage, 'balances', files[i]), { encoding: 'utf8' }));
                    return websocket.send(utility_1.Json.stringify(new class_1.Command('Get_Balances_Result', balances)));
                case 'Add_Transaction':
                    let transaction = (0, class_1.anyToTransaction)(command.data);
                    if (transaction)
                        if (this.isTransactionValid(transaction)) {
                            this.cobweb.add(transaction);
                            this.omegas = transaction.targets;
                        }
                    break;
                case 'Get_omegas':
                    return websocket.send(utility_1.Json.stringify(new class_1.Command('Get_omegas_Result', this.omegas)));
                case 'Get_Deleted':
                    return websocket.send(utility_1.Json.stringify(new class_1.Command('Get_Deleted_Result', this.deleted)));
            }
    }
    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     *
     * @since v1.0.0
     * @param transaction 거래
     * @returns boolean
     */
    isTransactionValid(
    /**
     * 거래
     */
    transaction) {
        let deleted = utility_1.Json.parse(utility_1.Json.stringify(this.deleted));
        for (let i = 0; i < transaction.targets.length; i++)
            if (!this.cobweb.spiders[transaction.targets[i]])
                if (!deleted.find((s) => s === transaction.targets[i]))
                    return false;
        let value = 0n;
        for (let i = 0; i < transaction.transfers.length; i++)
            value += transaction.transfers[i].value;
        if (value > (0, Get_1.getBalance)(transaction.author, this.storage))
            return false;
        return (0, class_1.isTransactionValid)(transaction);
    }
    /**
     * 거래를 검증합니다
     *
     * @since v1.0.0
     * @param transaction 스파이더
     * @param repeat 반복
     * @returns boolean
     */
    isSpiderValid(
    /**
     * 스파이더
     */
    spider) {
        for (let i = 0; i < spider.transaction.targets.length; i++) {
            let s = this.cobweb.spiders[spider.transaction.targets[i]];
            if (s)
                if ((0, class_1.isTransactionValid)(s.transaction))
                    return false;
        }
        let value = 0n;
        for (let i = 0; i < spider.transaction.transfers.length; i++)
            value += spider.transaction.transfers[i].value;
        if (value > (0, Get_1.getBalance)(spider.transaction.author, this.storage))
            return false;
        return (0, class_1.isTransactionValid)(spider.transaction);
    }
    onClose(url) {
        if (this.peers[url])
            delete this.peers[url];
    }
    async init(websocket, url) {
        let peers = await (0, Get_1.getNodes)(websocket, this.timeout);
        if (peers)
            await this.addPeer(websocket, url, peers);
        else
            throw new Error();
        let spiders = await (0, Get_1.getSpiders)(websocket, this.address, this.timeout);
        if (spiders)
            this.cobweb = new class_1.Cobweb(spiders);
        else
            throw new Error();
        let omegas = await (0, Get_1.getOmegas)(websocket, this.timeout);
        if (omegas)
            this.omegas = omegas;
        else
            throw new Error();
        let deleted = await (0, Get_1.getDeleted)(websocket, this.timeout);
        if (deleted)
            this.deleted = deleted;
        else
            throw new Error();
        let balances = await (0, Get_1.getBalances)(websocket, this.timeout);
        if (balances)
            for (let i = 0; i < Object.keys(balances).length; i++) {
                if (Object.keys(balances)[i] === this.address)
                    this.balance = balances[Object.keys(balances)[i]];
                (0, fs_1.writeFileSync)(path.join(this.storage, 'balances', `${Object.keys(balances)[i]}.json`), utility_1.Json.stringify(balances[Object.keys(balances)[i]]), { encoding: 'utf8' });
            }
        else
            throw new Error();
    }
    addPeer(websocket, url, peers) {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < Object.keys(peers).length; i++)
                if (Object.keys(peers)[i] === url)
                    this.peers[Object.keys(peers)[i]] = { websocket: websocket, address: peers[Object.keys(peers)[i]] };
                else {
                    let ws = new ws_1.WebSocket(Object.keys(peers)[i]);
                    ws.send(utility_1.Json.stringify(new class_1.Command('Add_Peer')));
                    this.peers[Object.keys(peers)[i]] = { websocket: ws, address: peers[Object.keys(peers)[i]] };
                }
        });
    }
}
exports.Node = Node;
//# sourceMappingURL=index.js.map
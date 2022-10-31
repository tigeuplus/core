"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalances = void 0;
const class_1 = require("@tigeuplus/class");
const utility_1 = require("@tigeuplus/utility");
/**
 * 모든 밸런스를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: bigint } | undefined>
 */
function getBalances(
/**
 * 노드
 */
node, 
/**
 * 타임아웃
 */
time) {
    return new Promise((resolve, reject) => {
        let stop = false;
        let timeout = setTimeout(() => {
            stop = true;
        }, time);
        let onMessage = ((message) => {
            let balances;
            let command = (0, class_1.anyToCommand)(message);
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
            node.once('message', onMessage);
        });
        node.once('message', onMessage);
        node.send(new utility_1.Json().stringify(new class_1.Command('Get_Balances')));
    });
}
exports.getBalances = getBalances;
//# sourceMappingURL=index.js.map
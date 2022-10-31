"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOmegas = void 0;
const class_1 = require("@tigeuplus/class");
const utility_1 = require("@tigeuplus/utility");
/**
 * 마지막 스파이더 해시를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
function getOmegas(
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
            let omegas;
            let command = (0, class_1.anyToCommand)(message);
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
                        break;
                }
            if (stop)
                return resolve();
            if (omegas)
                return resolve(omegas);
            node.once('message', onMessage);
        });
        node.once('message', onMessage);
        node.send(new utility_1.Json().stringify(new class_1.Command('Get_omegas')));
    });
}
exports.getOmegas = getOmegas;
//# sourceMappingURL=index.js.map
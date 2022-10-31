"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeleted = void 0;
const class_1 = require("@tigeuplus/class");
const utility_1 = require("@tigeuplus/utility");
/**
 * 삭제된 스파이더를 가져옵니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
function getDeleted(
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
            let deleted;
            let command = (0, class_1.anyToCommand)(message);
            if (command)
                switch (command.name) {
                    case 'Get_omegas_Result':
                        if (command.data instanceof Array) {
                            let succes = true;
                            for (let i = 0; i < command.data.length; i++)
                                if (typeof command.data[i] !== 'string') {
                                    succes = false;
                                    break;
                                }
                            if (succes)
                                deleted = command.data;
                        }
                        break;
                }
            if (stop)
                return resolve();
            if (deleted)
                return resolve(deleted);
            node.once('message', onMessage);
        });
        node.once('message', onMessage);
        node.send(new utility_1.Json().stringify(new class_1.Command('Get_Deleted')));
    });
}
exports.getDeleted = getDeleted;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodes = void 0;
const class_1 = require("@tigeuplus/class");
const utility_1 = require("@tigeuplus/utility");
/**
 * 모든 노드 주소를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: string } | undefined>
 */
function getNodes(
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
            let nodes;
            let command = (0, class_1.anyToCommand)(message);
            if (command)
                switch (command.name) {
                    case 'Get_nodes_Result':
                        if (command.data instanceof Object) {
                            let success = true;
                            for (let i = 0; i < Object.keys(command.data).length; i++)
                                if (typeof command.data[Object.keys(command.data)[i]] !== 'string') {
                                    success = false;
                                    break;
                                }
                            if (success)
                                nodes = command.data;
                        }
                        break;
                }
            if (nodes)
                return resolve(nodes);
            if (stop)
                return resolve();
            node.once('message', onMessage);
        });
        node.once('message', onMessage);
        node.send(utility_1.Json.stringify(new class_1.Command('Get_nodes')));
    });
}
exports.getNodes = getNodes;
//# sourceMappingURL=index.js.map
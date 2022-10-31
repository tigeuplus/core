"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpiders = void 0;
const class_1 = require("@tigeuplus/class");
const utility_1 = require("@tigeuplus/utility");
/**
 * 모든 스파이더를 조회합니다
 *
 * @since v1.0..0
 * @param node 노드
 * @param address 주소
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: Spider } | undefined>
 */
function getSpiders(
/**
 * 노드
 */
node, 
/**
 * 주소
 */
address, 
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
            let spiders;
            let command = (0, class_1.anyToCommand)(message);
            if (command)
                switch (command.name) {
                    case 'Get_Spiders_Result':
                        if (command.data instanceof Object) {
                            let success = true;
                            for (let i = 0; i < Object.keys(command.data).length; i++)
                                if (!(0, class_1.isSpiderTypeValid)(command.data[Object.keys(command.data)[i]])) {
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
            node.once('message', onMessage);
        });
        node.once('message', onMessage);
        node.send(new utility_1.Json().stringify(new class_1.Command('Get_Spiders', address)));
    });
}
exports.getSpiders = getSpiders;
//# sourceMappingURL=index.js.map
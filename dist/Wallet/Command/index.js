"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyToCommand = exports.isCommandTypeValid = exports.Command = void 0;
/**
 * 명령
 *
 * @since v1.0.0-alpha
 * @param name 이름
 * @param data 데이터
 */
class Command {
    name;
    data;
    constructor(
    /**
     * 이름
     */
    name, 
    /**
     * 데이터
     */
    data) {
        this.name = name;
        this.data = data;
    }
}
exports.Command = Command;
/**
 * 데이터가 명령인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
function isCommandTypeValid(data) {
    if (data instanceof Object)
        return typeof data.name === 'string';
    return false;
}
exports.isCommandTypeValid = isCommandTypeValid;
/**
 * 데이터를 명령으로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Command | undefined
 */
function anyToCommand(data) {
    if (isCommandTypeValid(data))
        return new Command(data.name, data.data);
}
exports.anyToCommand = anyToCommand;
//# sourceMappingURL=index.js.map
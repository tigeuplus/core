"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyToCommand = exports.isCommandTypeValid = exports.Command = void 0;
class Command {
    name;
    data;
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}
exports.Command = Command;
function isCommandTypeValid(data) {
    if (data instanceof Object)
        return typeof data.name === 'string';
    return false;
}
exports.isCommandTypeValid = isCommandTypeValid;
function anyToCommand(data) {
    if (isCommandTypeValid(data))
        return new Command(data.name, data.data);
}
exports.anyToCommand = anyToCommand;
//# sourceMappingURL=index.js.map
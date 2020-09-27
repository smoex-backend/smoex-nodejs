"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaildateParams = void 0;
const tslib_1 = require("tslib");
function udpateParams(params, name, value) {
    const [curname, subname] = name.split('.');
    if (subname) {
        params[curname] = Object.assign(Object.assign({}, params[curname]), { [subname]: value });
    }
    else {
        params[curname] = value;
    }
}
const simpleParser = {
    // @ts-ignore
    number: (value) => [!isNaN(value), Number(value)],
    boolean: (value) => [value === 'true' || value === 'false', value === 'true' ? true : false],
    array: (value) => [Array.isArray(value), value],
    string: (value) => [true, value],
};
exports.vaildateParams = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    ctx.vailate = (checks) => {
        const errors = [];
        const params = {};
        for (const check of checks) {
            const { name: names, type: types, rules = [] } = check;
            const [paramName, fromName] = names.split('|');
            const name = fromName || paramName;
            const value = ctx.query[name] || ctx.request.body[name];
            const [type, subtype] = types.split('|');
            if (!subtype && Object.keys(simpleParser).includes(type)) {
                // @ts-ignore
                const [isPass, parsedValue] = simpleParser[type](value);
                if (isPass) {
                    udpateParams(params, paramName, parsedValue);
                }
                else {
                    errors.push({ value, message: `${name} filed is not ${types}` });
                }
            }
            else if (type === 'array') {
                let error = null;
                if (!Array.isArray(value)) {
                    errors.push({ value, message: `${name} filed is not ${types}` });
                }
                else {
                    const resvalue = [];
                    for (const arrvalue of value) {
                        // @ts-ignore
                        const [isPass, parsedValue] = simpleParser[subtype](arrvalue);
                        if (!isPass) {
                            error = { value, message: `${name} filed is not ${types}` };
                            break;
                        }
                        else {
                            resvalue.push(parsedValue);
                        }
                    }
                    if (error) {
                        errors.push(error);
                    }
                    else {
                        udpateParams(params, paramName, resvalue);
                    }
                }
            }
        }
        if (Object.keys(errors).length) {
            ctx.throw({ code: 10, message: 'vailate failed', errors });
        }
        return params;
    };
    yield next();
});

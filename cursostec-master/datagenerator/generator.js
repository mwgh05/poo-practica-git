"use strict";
// docker run -it --rm --name nodetsc -v C:\dev\cursostec\datagenerator:/home node bash
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var config_1 = require("./config");
var fs = require("fs");
var StringBuilder = require("string-builder");
function generate() {
    var result = new StringBuilder();
    config_1.configurations.map(function (config) {
        var stickyness = {};
        var stickysubtotal = Math.floor(Math.random() * (config.maxstickyness - config.minstickyness)) + config.minstickyness;
        var stickycounter = 0;
        var batchSize = 1000;
        var countBatch = 0;
        var _loop_1 = function () {
            var record = {};
            config.fields.map(function (field) {
                switch (field.type) {
                    case "consecutive": {
                        if (!field["value"]) {
                            field["value"] = field.starting;
                        }
                        else {
                            field["value"] += field.increment;
                        }
                        break;
                    }
                    case "date": {
                        var distIndex = Math.random();
                        field.distributions.map(function (distribution) {
                            if (distribution.percentageMin <= distIndex && distribution.percentageMax >= distIndex) {
                                var day = distribution.days[Math.floor(Math.random() * distribution.days.length)];
                                var month = distribution.months[Math.floor(Math.random() * distribution.months.length)];
                                var year = distribution.years[Math.floor(Math.random() * distribution.years.length)];
                                var hour = Math.floor(Math.random() * 24);
                                var minute = Math.floor(Math.random() * 60);
                                var seconds = Math.floor(Math.random() * 60);
                                field["value"] = new Date(year, month, day, hour, minute, seconds);
                            }
                        });
                        break;
                    }
                    case "combinations": {
                        field["value"] = field.sourceA[Math.floor(Math.random() * field.sourceA.length)] + " ";
                        if (field.sourceB) {
                            field["value"] += field.sourceB[Math.floor(Math.random() * field.sourceB.length)] + " ";
                        }
                        field["value"] += Math.floor(Math.random() * Number.MAX_SAFE_INTEGER + 100000);
                        break;
                    }
                    case "text": {
                        field["value"] = field.source + (field.unique ? " " + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER + 100000) : "");
                        break;
                    }
                    case "option": {
                        field["value"] = field.source[Math.floor(Math.random() * field.source.length)];
                        break;
                    }
                    case "number": {
                        field["value"] = field.min + Math.floor(Math.random() * (field.max - field.min));
                        break;
                    }
                }
                if (field.sticky && field.sticky == true) {
                    if (stickycounter == 0) {
                        stickyness[field.fieldname] = field["value"];
                    }
                }
                else {
                    record[field.fieldname] = field["value"];
                }
            });
            stickycounter++;
            stickycounter %= stickysubtotal;
            if (stickycounter == 0) {
                stickysubtotal = Math.floor(Math.random() * (config.maxstickyness - config.minstickyness)) + config.minstickyness;
            }
            var finalrecord = __assign(__assign({}, record), stickyness);
            result.append(JSON.stringify(finalrecord) + "\n");
            countBatch++;
            countBatch %= batchSize;
            if (countBatch == 0) {
                fs.appendFileSync(config.filename, result.toString());
                result.clear();
            }
        };
        for (var quantity = 0; quantity < config.quantity; quantity++) {
            _loop_1();
        }
        ;
        if (result.toString().length > 0) {
            fs.appendFileSync(config.filename, result.toString());
            result.clear();
        }
    });
}
generate();

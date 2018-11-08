const webpack = require('webpack')
const path = require('path')
const AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
const DEP_BLOCK_NAME = 'AsyncDependenciesBlock';

function checkConstructorNames(object) {
    const obj = Object.getPrototypeOf(object);
    if(obj) {
        if (obj.constructor.name === DEP_BLOCK_NAME) {
            return true;
        } else {
            return checkConstructorNames(obj);
        }
    } else {
        return false;
    }
}

function AsyncChunkNames(options) {
    this.options = options;
}

AsyncChunkNames.prototype.apply = function (compiler) {
    const self = this;
    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('seal', function () {
            compilation.modules.forEach(function (module) {
                module.blocks.forEach(function (block) {
                    if (checkConstructorNames(block)) {
                        block.dependencies.forEach(function (dependency) {
                            const relativepath = path.relative(process.cwd(), dependency.module.resource);
                            const name = self.options.parser(relativepath);
                            dependency.block.chunkName = name;
                            dependency.block.name = name;
                        });
                    }
                });
            });
        });
    });
}

module.exports = AsyncChunkNames;

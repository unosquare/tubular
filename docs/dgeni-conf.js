// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');
var Package = require('dgeni').Package;

module.exports = new Package('tubular', [
        require('../node_modules/dgeni-packages/jsdoc'),
        require('../node_modules/dgeni-packages/nunjucks'),
        require('../node_modules/dgeni-packages/links')
    ])
    .factory(require('../node_modules/dgeni-packages/ngdoc/file-readers/ngdoc'))
    .factory(require('../node_modules/dgeni-packages/ngdoc/services/getTypeClass'))
    .factory(require('../node_modules/dgeni-packages/ngdoc/services/moduleMap'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/filterNgdocs'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/generateComponentGroups'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/memberDocs'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/moduleDocs'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/providerDocs'))
    .processor(require('../node_modules/dgeni-packages/ngdoc/processors/collectKnownIssues'))
    .config(function(log, readFilesProcessor, writeFilesProcessor) {
        //log.level = 'info';

        readFilesProcessor.basePath = path.resolve(__dirname, '..');
        readFilesProcessor.sourceFiles = [
            { include: 'vendor/tubular/tubular-bundle.js', basePath: 'vendor/tubular' },
            { include: 'vendor/tubular/tubular-chartjs-bundle.js', basePath: 'vendor/tubular' },
            { include: 'vendor/tubular/tubular-highcharts-bundle.js', basePath: 'vendor/tubular' },
            { include: 'vendor/tubular/tubular-reporting-bundle.js', basePath: 'vendor/tubular' },
            { include: 'vendor/tubular/tubular-widget-bundle.js', basePath: 'vendor/tubular' }
        ];

        writeFilesProcessor.outputFolder = 'docs/build';
    })
    .config(function(parseTagsProcessor, getInjectables) {
        parseTagsProcessor.tagDefinitions =
            parseTagsProcessor.tagDefinitions.concat(getInjectables(require('../node_modules/dgeni-packages/ngdoc/tag-defs')));
    })
    .config(function(templateFinder, templateEngine, getInjectables) {

        templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));

        templateEngine.config.tags = {
            variableStart: '{$',
            variableEnd: '$}'
        };

        templateFinder.templatePatterns = [
            '${ doc.template }',
            '${ doc.id }.${ doc.docType }.template.html',
            '${ doc.id }.template.html',
            '${ doc.docType }.template.html',
            'common.template.html'
        ]; //.concat(templateEngine.templatePatterns);

        templateEngine.filters = templateEngine.filters.concat(getInjectables([
            require('../node_modules/dgeni-packages/ngdoc/rendering/filters/code'),
            require('../node_modules/dgeni-packages/ngdoc/rendering/filters/link'),
            require('../node_modules/dgeni-packages/ngdoc/rendering/filters/type-class')
        ]));

        templateEngine.tags = templateEngine.tags.concat(getInjectables([require('../node_modules/dgeni-packages/ngdoc/rendering/tags/code')]));
    })
    .config(function(computeIdsProcessor, createDocMessage, getAliases) {

        computeIdsProcessor.idTemplates.push({
            docTypes: ['module'],
            idTemplate: 'module:${name}',
            getAliases: getAliases
        });

        computeIdsProcessor.idTemplates.push({
            docTypes: ['method', 'property', 'event'],
            getId: function(doc) {
                var parts = doc.name.split('#');
                var name = parts.pop();
                parts.push(doc.docType + ':' + name);
                return parts.join('#');
            },
            getAliases: getAliases
        });

        computeIdsProcessor.idTemplates.push({
            docTypes: ['provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type', 'constants', 'component', 'factory'],
            idTemplate: 'module:${module}.${docType}:${name}',
            getAliases: getAliases
        });
    })
    .config(function(computePathsProcessor, createDocMessage) {
        computePathsProcessor.pathTemplates.push({
            docTypes: ['provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type', 'constants', 'component', 'factory'],
            pathTemplate: '${module}/${docType}/${name}',
            outputPathTemplate: '${module}/${docType}/${name}.html'
        });
        computePathsProcessor.pathTemplates.push({
            docTypes: ['module'],
            pathTemplate: '${name}',
            outputPathTemplate: '${name}/index.html'
        });
        computePathsProcessor.pathTemplates.push({
            docTypes: ['componentGroup'],
            pathTemplate: '${moduleName}/${groupType}',
            outputPathTemplate: '${moduleName}/${groupType}/index.html'
        });
    })
    .config(function(getLinkInfo) {
        getLinkInfo.relativeLinks = false;
    });
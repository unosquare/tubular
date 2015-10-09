(function() {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTranslate
         *
         * @description
         * Use `tubularTranslate` to translate strings.
         */
        .service('tubularTranslate', [
            function tubularTranslate() {
                var me = this;

                me.currentLanguage = 'en';
                me.defaultLanguage = 'en';

                me.translationTable = {
                    'en': {
                        'EDITOR_REGEX_DOESNT_MATCH': "The field doesn't match the regular expression.",
                        'EDITOR_REQUIRED': "The field is required.",
                        'EDITOR_MIN_CHARS': "The field needs to be minimum {0} chars.",
                        'EDITOR_MAX_CHARS': "The field needs to be maximum {0} chars.",
                        'EDITOR_MIN_NUMBER': "The minimum number is {0}.",
                        'EDITOR_MAX_NUMBER': "The maximum number is {0}.",
                        'EDITOR_MIN_DATE': "The minimum date is {0}.",
                        'EDITOR_MAX_DATE': "The maximum date is {0}.",
                        'CAPTION_APPLY': 'Apply',
                        'CAPTION_CLEAR': 'Clear',
                        'CAPTION_CLOSE': 'Close',
                        'CAPTION_SELECTCOLUMNS': 'Select Columns',
                        'CAPTION_FILTER': 'Filter',
                        'CAPTION_VALUE': 'Value',
                        'CAPTION_REMOVE': 'Remove',
                        'CAPTION_CANCEL': 'Cancel',
                        'CAPTION_EDIT': 'Edit',
                        'CAPTION_SAVE': 'Save',
                        'CAPTION_PRINT': 'Print',
                        'UI_SEARCH': 'search . . .',
                        'UI_PAGESIZE': 'Page size:',
                        'UI_EXPORTCSV': 'Export CSV',
                        'UI_CURRENTROWS': 'Current rows',
                        'UI_ALLROWS': 'All rows',
                        'UI_REMOVEROW': 'Do you want to delete this row?',
                        'UI_SHOWINGRECORDS': 'Showing {0} to {1} of {2} records',
                        'UI_FILTEREDRECORDS': '(Filtered from {0} total records)',
                        'UI_HTTPERROR': 'Unable to contact server; please, try again later.',
                        'OP_NONE': 'None',
                        'OP_EQUALS': 'Equals',
                        'OP_NOTEQUALS': 'Not Equals',
                        'OP_CONTAINS': 'Contains',
                        'OP_NOTCONTAINS': 'Not Contains',
                        'OP_STARTSWITH': 'Starts With',
                        'OP_NOTSTARTSWITH': 'Not Starts With',
                        'OP_ENDSWITH': 'Ends With',
                        'OP_NOTENDSWITH': 'Not Ends With',
                        'OP_BETWEEN': 'Between'
                    },
                    'es': {
                        'EDITOR_REGEX_DOESNT_MATCH': "El campo no es válido contra la expresión regular.",
                        'EDITOR_REQUIRED': "El campo es requerido.",
                        'EDITOR_MIN_CHARS': "El campo requiere mínimo {0} caracteres.",
                        'EDITOR_MAX_CHARS': "El campo requiere máximo {0} caracteres.",
                        'EDITOR_MIN_NUMBER': "El número mínimo es {0}.",
                        'EDITOR_MAX_NUMBER': "El número maximo es {0}.",
                        'EDITOR_MIN_DATE': "La fecha mínima es {0}.",
                        'EDITOR_MAX_DATE': "La fecha maxima es {0}.",
                        'CAPTION_APPLY': 'Aplicar',
                        'CAPTION_CLEAR': 'Limpiar',
                        'CAPTION_CLOSE': 'Cerrar',
                        'CAPTION_SELECTCOLUMNS': 'Seleccionar columnas',
                        'CAPTION_FILTER': 'Filtro',
                        'CAPTION_VALUE': 'Valor',
                        'CAPTION_REMOVE': 'Remover',
                        'CAPTION_CANCEL': 'Cancelar',
                        'CAPTION_EDIT': 'Editar',
                        'CAPTION_SAVE': 'Guardar',
                        'CAPTION_PRINT': 'Imprimir',
                        'UI_SEARCH': 'buscar . . .',
                        'UI_PAGESIZE': '# Registros:',
                        'UI_EXPORTCSV': 'Exportar CSV',
                        'UI_CURRENTROWS': 'Esta página',
                        'UI_ALLROWS': 'Todo',
                        'UI_REMOVEROW': '¿Desea eliminar el registro?',
                        'UI_SHOWINGRECORDS': 'Mostrando registros {0} al {1} de {2}',
                        'UI_FILTEREDRECORDS': '(De un total de {0} registros)',
                        'UI_HTTPERROR': 'No se logro contactar el servidor, intente más tarde.',
                        'OP_NONE': 'Ninguno',
                        'OP_EQUALS': 'Igual',
                        'OP_NOTEQUALS': 'No Igual',
                        'OP_CONTAINS': 'Contiene',
                        'OP_NOTCONTAINS': 'No Contiene',
                        'OP_STARTSWITH': 'Comienza Con',
                        'OP_NOTSTARTSWITH': 'No Comienza Con',
                        'OP_ENDSWITH': 'Termina Con',
                        'OP_NOTENDSWITH': 'No Termina Con',
                        'OP_BETWEEN': 'Entre'
                    }
                };

                me.setLanguage = function(language) {
                    // TODO: Check translationTable first
                    me.currentLanguage = language;

                    return me;
                };

                me.addTranslation = function(language, key, value) {
                    var languageTable = me.translationTable[language] || me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];
                    languageTable[key] = value;

                    return me;
                }

                me.translate = function(key) {
                    var languageTable = me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];

                    return languageTable[key] || key;
                };

                me.reverseTranslate = function(value) {
                    // TODO: Find value
                };
            }
        ])
        /**
         * @ngdoc filter
         * @name translate
         *
         * @description
         * Translate a key to the current language
         */
        .filter('translate', [
            'tubularTranslate', function(tubularTranslate) {
                return function(input, param1, param2, param3, param4) {
                    // TODO: Probably send an optional param to define language
                    if (angular.isDefined(input)) {
                        var translation = tubularTranslate.translate(input);

                        translation = translation.replace("{0}", param1 || '');
                        translation = translation.replace("{1}", param2 || '');
                        translation = translation.replace("{2}", param3 || '');
                        translation = translation.replace("{3}", param4 || '');

                        return translation;
                    }

                    return input;
                };
            }
        ]);
})();
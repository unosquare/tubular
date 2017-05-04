(function (angular) {
    'use strict';

    angular.module('tubular.services')
        /**
         * @ngdoc service
         * @name tubularTranslate
         *
         * @description
         * Use `tubularTranslate` to translate strings.
         */
        .service('tubularTranslate', [function () {
            var me = this;

            me.currentLanguage = 'en';
            me.defaultLanguage = 'en';

            me.translationTable = {
                'en': {
                    'EDITOR_REGEX_DOESNT_MATCH': 'The field doesn\'t match the regular expression.',
                    'EDITOR_REQUIRED': 'The field is required.',
                    'EDITOR_MIN_CHARS': 'The field needs to be minimum {0} chars.',
                    'EDITOR_MAX_CHARS': 'The field needs to be maximum {0} chars.',
                    'EDITOR_MIN_NUMBER': 'The minimum number is {0}.',
                    'EDITOR_MAX_NUMBER': 'The maximum number is {0}.',
                    'EDITOR_MIN_DATE': 'The minimum date is {0}.',
                    'EDITOR_MAX_DATE': 'The maximum date is {0}.',
                    'EDITOR_MATCH': 'The field needs to match the {0} field.',
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
                    'CAPTION_LOAD': 'Load',
                    'CAPTION_ADD': 'Add',
                    'UI_SEARCH': 'search . . .',
                    'UI_PAGESIZE': 'Page size:',
                    'UI_EXPORTCSV': 'Export CSV',
                    'UI_CURRENTROWS': 'Current rows',
                    'UI_ALLROWS': 'All rows',
                    'UI_REMOVEROW': 'Do you want to delete this row?',
                    'UI_SHOWINGRECORDS': 'Showing {0} to {1} of {2} records',
                    'UI_FILTEREDRECORDS': '(Filtered from {0} total records)',
                    'UI_HTTPERROR': 'Unable to contact server; please, try again later.',
                    'UI_GENERATEREPORT': 'Generate Report',
                    'UI_TWOCOLS': 'Two columns',
                    'UI_ONECOL': 'One column',
                    'UI_MAXIMIZE': 'Maximize',
                    'UI_RESTORE': 'Restore',
                    'UI_MOVEUP': 'Move Up',
                    'UI_MOVEDOWN': 'Move Down',
                    'UI_MOVELEFT': 'Move Left',
                    'UI_MOVERIGHT': 'Move Right',
                    'UI_COLLAPSE': 'Collapse',
                    'UI_EXPAND': 'Expand',
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
                    'EDITOR_REGEX_DOESNT_MATCH': 'El campo no es válido contra la expresión regular.',
                    'EDITOR_REQUIRED': 'El campo es requerido.',
                    'EDITOR_MIN_CHARS': 'El campo requiere mínimo {0} caracteres.',
                    'EDITOR_MAX_CHARS': 'El campo requiere máximo {0} caracteres.',
                    'EDITOR_MIN_NUMBER': 'El número mínimo es {0}.',
                    'EDITOR_MAX_NUMBER': 'El número maximo es {0}.',
                    'EDITOR_MIN_DATE': 'La fecha mínima es {0}.',
                    'EDITOR_MAX_DATE': 'La fecha máxima es {0}.',
                    'EDITOR_MATCH': 'El campo debe de conincidir con el campo {0}.',
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
                    'CAPTION_LOAD': 'Cargar',
                    'CAPTION_ADD': 'Agregar',
                    'UI_SEARCH': 'buscar . . .',
                    'UI_PAGESIZE': '# Registros:',
                    'UI_EXPORTCSV': 'Exportar CSV',
                    'UI_CURRENTROWS': 'Esta página',
                    'UI_ALLROWS': 'Todo',
                    'UI_REMOVEROW': '¿Desea eliminar el registro?',
                    'UI_SHOWINGRECORDS': 'Mostrando registros {0} al {1} de {2}',
                    'UI_FILTEREDRECORDS': '(De un total de {0} registros)',
                    'UI_HTTPERROR': 'No se logro contactar el servidor, intente más tarde.',
                    'UI_GENERATEREPORT': 'Generar Reporte',
                    'UI_TWOCOLS': 'Dos columnas',
                    'UI_ONECOL': 'Una columna',
                    'UI_MAXIMIZE': 'Maximizar',
                    'UI_RESTORE': 'Restaurar',
                    'UI_MOVEUP': 'Mover Arriba',
                    'UI_MOVEDOWN': 'Mover Abajo',
                    'UI_MOVELEFT': 'Mover Izquierda',
                    'UI_MOVERIGHT': 'Mover Derecha',
                    'UI_COLLAPSE': 'Colapsar',
                    'UI_EXPAND': 'Expandir',
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

            // TODO: Check translationTable first
            me.setLanguage = language => me.currentLanguage = language;

            me.addTranslation = (language, key, value) => {
                var languageTable = me.translationTable[language] ||
                    me.translationTable[me.currentLanguage] ||
                    me.translationTable[me.defaultLanguage];
                languageTable[key] = value;
            };

            me.translate = (key) => {
                var languageTable = me.translationTable[me.currentLanguage] || me.translationTable[me.defaultLanguage];

                return languageTable[key] || key;
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
            'tubularTranslate', function (tubularTranslate) {
                return function (input, param1, param2, param3, param4) {
                    if (angular.isDefined(input)) {
                        var translation = tubularTranslate.translate(input);

                        translation = translation.replace('{0}', param1 || '');
                        translation = translation.replace('{1}', param2 || '');
                        translation = translation.replace('{2}', param3 || '');
                        translation = translation.replace('{3}', param4 || '');

                        return translation;
                    }

                    return input;
                };
            }
        ]);
})(angular);
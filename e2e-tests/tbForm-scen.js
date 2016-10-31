/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false */

describe('tbForm related components', function () {
    var trueFunc = function () { return true; };
    /**********************/
    // *     Global     * //
    /**********************/
    var tbFormEditBtn1,
        tbFormEditBtn2,
        tbFormSaveBtn,
        tbFormCancelBtn;

    /**********************/
    // * tbSimpleEditor * //
    /**********************/
    var tbSimpleEditor,
        tbSimpleEditor_input,
        tbSimpleEditor_label,
        tbSimpleEditor_helper,
        tbSimpleEditor_errorMessages,
        tbSimpleEditorCustomer_original = 'Unosquare LLC';

    var tbSimpleEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            }).then(function () {
                return tbFormEditBtn1.click().then(function () {
                    return tbSimpleEditor_input.getAttribute('value').then(function (val) {
                        if (val != tbSimpleEditorCustomer_original) {
                            return tbSimpleEditor_input.clear().then(function () {
                                return tbSimpleEditor_input.sendKeys(tbSimpleEditorCustomer_original).then(function () {
                                    return tbFormSaveBtn.click().then(trueFunc);
                                });
                            });
                        } else {
                            return tbFormCancelBtn.click().then(trueFunc);
                        }
                    });
                });
            });
        });
    }

    /************************/
    //  * tbNumericEditor * //
    /************************/
    var tbNumericEditor,
        tbNumericEditor_input,
        tbNumericEditor_label,
        tbNumericEditor_helper,
        tbNumericEditor_errorMessages,
        tbNumericEditorValue_original = '300';

    var tbNumericEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn1.click().then(function () {
                        return tbNumericEditor_input.getAttribute('value').then(function (val) {
                            if (val != tbNumericEditorValue_original) {
                                return tbNumericEditor_input.clear().then(function () {
                                    return tbNumericEditor_input.sendKeys(tbNumericEditorValue_original).then(function () {
                                        return tbFormSaveBtn.click().then(trueFunc);
                                    });
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    /**************************/
    //  * tbTypeaheadEditor * //
    /**************************/
    var tbTypeaheadEditor,
        tbTypeaheadEditor_input,
        tbTypeaheadEditor_label,
        tbTypeaheadEditor_helper,
        tbTypeaheadEditor_errorMessages,
        tbTypeaheadEditor_options,
        tbTypeaheadEditorCity_original = 'Guadalajara, JAL, Mexico',
        tbTypeaheadEditorCity_originalMatcher = 'Guad';

    var tbTypeaheadEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn1.click().then(function () {
                        return tbTypeaheadEditor_input.getAttribute('value').then(function (val) {
                            if (val != tbTypeaheadEditorCity_original) {
                                return tbTypeaheadEditor_input.clear().then(function () {
                                    return tbTypeaheadEditor_input.sendKeys(tbTypeaheadEditorCity_originalMatcher).then(function () {
                                        return tbTypeaheadEditor_options.first().click().then(function () {
                                            return tbFormSaveBtn.click().then(trueFunc);
                                        });
                                    });
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    /**************************/
    //    * tbDateEditor *    //
    /**************************/
    var tbDateEditor,
        tbDateEditor_input,
        tbDateEditor_label,
        tbDateEditor_helper,
        tbDateEditor_errorMessages,
        tbDateEditorDate_original = '02/02/2016';


    var tbDateEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn1.click().then(function () {
                        return tbDateEditor_input.getAttribute('value').then(function (val) {
                            if (val != tbDateEditorDate_original) {
                                return tbDateEditor_input.clear().then(function () {
                                    return tbDateEditor_input.sendKeys(tbDateEditorDate_original).then(function () {
                                        return tbFormSaveBtn.click().then(trueFunc);
                                    });
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    /**************************/
    //     * tbTextArea *     //
    /**************************/
    var tbTextArea,
        tbTextArea_input,
        tbTextArea_label,
        tbTextArea_helper,
        tbTextArea_errorMessages,
        tbTextAreaCustomer_original = 'Microsoft';

    var tbTextAreaRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn2.click().then(function () {
                        return tbTextArea_input.getAttribute('value').then(function (val) {
                            if (val != tbTextAreaCustomer_original) {
                                return tbTextArea_input.clear().then(function () {
                                    return tbTextArea_input.sendKeys(tbTextAreaCustomer_original).then(function () {
                                        return tbFormSaveBtn.click().then(trueFunc);
                                    });
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    /****************************/
    //  * tbtbDropdownEditor *  //
    /****************************/
    var tbDropDownEditor,
        tbDropDownEditor_select,
        tbDropDownEditor_label,
        tbDropDownEditor_helper,
        tbDropDownEditor_errorMessages,
        tbDropDownEditorCity_original = 'string:Guadalajara, JAL, Mexico';

    function selectDropDownOption(filterText) {
        return tbDropDownEditor.$$('option').filter(function (elem) {
            return elem.getText().then(function (text) {
                return text.indexOf(filterText) != -1;
            });
        }).first();
    };

    var tbDropDownEditorRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn2.click().then(function () {
                        return tbDropDownEditor_select.getAttribute('value').then(function (val) {
                            if (val != tbDropDownEditorCity_original) {
                                return selectDropDownOption('Guadalajara').click().then(function () {
                                    return tbFormSaveBtn.click().then(trueFunc);
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    /****************************/
    //  * tbCheckboxField *  //
    /****************************/
    var tbCheckboxField,
        tbCheckboxField_onRow;

    var tbCheckboxFieldRestore = function () {
        return browser.wait(function () {
            return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            })
                .then(function () {
                    return tbFormEditBtn2.click().then(function () {
                        return tbCheckboxField.getAttribute('class').then(function (val) {
                            if (val.indexOf('ng-empty') == -1) {
                                return tbCheckboxField.click().then(function () {
                                    return tbFormSaveBtn.click().then(trueFunc);
                                });
                            }
                            else {
                                return tbFormCancelBtn.click().then(trueFunc);
                            }
                        });
                    });
                });
        });
    }

    beforeAll(function () {
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormTest')).click().then(function () {
            // Save and Cancel buttons
            tbFormSaveBtn = $('div.modal-dialog form').$('#btnSave');
            tbFormCancelBtn = $('div.modal-dialog form').$('#btnCancel');
        });
    });

    beforeEach(function () {
        browser.executeScript('localStorage.clear()');
    });

    afterAll(function () {
        browser.executeScript('localStorage.clear()');
    });

    describe('tbCheckboxField', function () {
        beforeAll(function () {
            //* Assign test variables *\\
            // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa ... >
            tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first().$$('button').last();
            // tbDropDownEditor component and subcomponents
            tbCheckboxField = $('div.modal-dialog form').$('tb-checkbox-field').$('input[type="checkbox"]');
            tbCheckboxField_onRow = element.all(by.repeater('row in $component.rows'))
                .get(1).$$('td').last().$('input[type="checkbox"]');

            //* Restore default value *\\
            tbCheckboxFieldRestore();
        });

        afterEach(function () {
            //* Restore default value *\\    
            tbCheckboxFieldRestore();
        });

        it('should save changes on "SAVE"', function () {
            // Ensure field is unckecked
            tbCheckboxField_onRow.getAttribute('class').then(function (val) {
                expect(val.indexOf('ng-empty')).not.toBe(-1);
            })
            .then(function () {
                tbFormEditBtn2.click().then(function () {
                    tbCheckboxField.click().then(function () {
                        tbFormSaveBtn.click().then(function () {
                            tbCheckboxField_onRow.getAttribute('class').then(function (val) {
                                expect(val.indexOf('ng-empty')).toBe(-1);
                            });
                        });
                    });
                });
            });
        });

        it('should discard changes on "CANCEL"', function () {
            // Ensure field is unckecked
            tbCheckboxField_onRow.getAttribute('class').then(function (val) {
                expect(val.indexOf('ng-empty')).not.toBe(-1);
            })
            .then(function () {
                tbFormEditBtn2.click().then(function () {
                    tbCheckboxField.click().then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbCheckboxField_onRow.getAttribute('class').then(function (val) {
                                expect(val.indexOf('ng-empty')).not.toBe(-1);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('tbDropDownEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa ... >
            tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first().$$('button').last();
            // tbDropDownEditor component and subcomponents
            tbDropDownEditor = $('div.modal-dialog form').$('tb-dropdown-editor');
            tbDropDownEditor_select = tbDropDownEditor.$('select');
            tbDropDownEditor_label = tbDropDownEditor.$('label');
            tbDropDownEditor_errorMessages = tbDropDownEditor.all(by.repeater('error in $ctrl.state.$errors'));
            tbDropDownEditor_helper = tbDropDownEditor.$$('span').filter(function (elem, index) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();

            //* Restore default value and open form popup *\\
            tbDropDownEditorRestore().then(tbFormEditBtn2.click);

        });

        afterEach(function () {
            //* Restore default value and open form popup *\\    
            tbDropDownEditorRestore().then(tbFormEditBtn2.click);
        });

        it('should set initial input value to the value of "value" attribute when defined', function () {
            expect(tbDropDownEditor_select.getAttribute('value')).toMatch(tbDropDownEditorCity_original);
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbDropDownEditor_label.getText()).toMatch('Shipper City');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbDropDownEditor_helper.getText()).toMatch("dropdown help");
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbDropDownEditor_select.getAttribute('value').then(function (option) {
                expect(option).toMatch(tbDropDownEditorCity_original);
            })
                .then(function () {
                    selectDropDownOption('Portland').click().then(function () {
                        tbFormSaveBtn.click().then(function () {
                            tbFormEditBtn2.click().then(function () {
                                expect(tbDropDownEditor_select.getAttribute('value')).toMatch('string:Portland, OR, USA');
                            });
                        });
                    });
                });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbDropDownEditor_select.getAttribute('value').then(function (option) {
                expect(option).toMatch(tbDropDownEditorCity_original);
            })
                .then(function () {
                    selectDropDownOption('Portland').click().then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbFormEditBtn2.click().then(function () {
                                expect(tbDropDownEditor_select.getAttribute('value')).toMatch(tbDropDownEditorCity_original);
                            });
                        });
                    });
                });
        });
    });

    describe('tbTextArea', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 1st element in list, should be: <OrderID = 1 , Customer Name = Microsoft ... >
            tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).first().$$('td').first().$$('button').last();
            // tbTextArea component and subcomponents
            tbTextArea = $('div.modal-dialog form').$('tb-text-area');
            tbTextArea_input = tbTextArea.$('textarea');
            tbTextArea_label = tbTextArea.$('label');
            tbTextArea_errorMessages = tbTextArea.all(by.repeater('error in $ctrl.state.$errors'));
            tbTextArea_helper = tbTextArea.$$('span').filter(function (elem, index) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();

            //* Restore default value and open form popup *\\
            tbTextAreaRestore().then(tbFormEditBtn2.click);
        });

        afterEach(function () {
            //* Restore default value and open form popup *\\    
            tbTextAreaRestore().then(tbFormEditBtn2.click);
        });

        it('should set initial input value to the value of "value" attribute when defined', function () {
            expect(tbTextArea_input.getAttribute('value')).toMatch(tbTextAreaCustomer_original);
        });

        it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbTextArea_input.clear().then(function () {
                // input 'Mi' < 3chars
                tbTextArea_input.sendKeys('Mi').then(function () {
                    tbTextArea_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'The field needs to be minimum 3 chars.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbTextArea_errorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbTextArea_input.sendKeys('crosoft').then(function () {
                                    // Expect min chars error to have been removed
                                    expect(tbTextArea_errorMessages.count()).toBeLessThan(messageCount);
                                });
                            });
                    })
                    .then(function () {
                        tbTextArea_input.sendKeys('ss').then(function () {
                            // Expect max chars error to be displayed
                            expect(tbTextArea_errorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbTextArea_label.getText()).toMatch('Customer Name');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbTextArea_helper.getText()).toMatch("text area help");
        });

        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbTextArea_input.clear().then(function () {
                tbTextArea_errorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        if (val == 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbTextArea_input.clear().then(function () {
                tbTextArea_input.sendKeys('Apple').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn2.click().then(function () {
                            tbTextArea_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch('Apple');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbTextArea_input.getAttribute('value').then(function (text) {
                expect(text).toMatch(tbTextAreaCustomer_original);
            })
            .then(function () {
                tbTextArea_input.sendKeys('Crocks').then(function () {
                    tbFormCancelBtn.click().then(function () {
                        tbFormEditBtn2.click().then(function () {
                            tbTextArea_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch(tbTextAreaCustomer_original);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('tbHiddenField', function () {

        beforeAll(function () {
            tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).first().$$('td').first().$$('button').last();

            tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            }).then(tbFormEditBtn2.click);
        });

        it('should be present and contain the attribute-defined value', function () {
            expect($('tb-hidden-field').getAttribute('value')).toMatch('YouDontSeeMe');
        });

    });

    describe('tbDateEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 4th element in list, should be: <OrderID = 4 , Customer Name = Unosquare LLC, Shipped Date = 1/30/16  ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(3).$$('td').first().$$('button').first();

            // tbSimpleEditor component and subcomponents
            tbDateEditor = $('div.modal-dialog form').$('tb-date-editor');
            tbDateEditor_input = $('div.modal-dialog form').$('tb-date-editor').$('input');
            tbDateEditor_label = $('div.modal-dialog form').$('tb-date-editor').$('label');
            tbDateEditor_errorMessages = $('div.modal-dialog form').$('tb-date-editor').all(by.repeater('error in $ctrl.state.$errors'));
            tbDateEditor_helper = $('div.modal-dialog form').$('tb-date-editor').$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();

            //* Restore default value and open form popup *\\
            tbDateEditorRestore().then(tbFormEditBtn1.click);

        });

        afterEach(function () {
            //* Restore default value and open form popup *\\    
            tbDateEditorRestore().then(tbFormEditBtn1.click);
        });

        it('should set initial date value to the value of "value" attribute when defined', function () {
            expect(tbDateEditor_input.getAttribute('value')).toMatch(tbDateEditorDate_original);
        });

        it('should be invalidated when the date is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbDateEditor_input.clear().then(function () {
                // input  an invalid < min date
                tbDateEditor_input.sendKeys('02/20/2015').then(function () {
                    tbDateEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'The minimum date is 01/28/2016.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbDateEditor_errorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbDateEditor_input.clear().then(function () {
                                    tbDateEditor_input.sendKeys('05/08/2016').then(function () {
                                        // Expect min date error to have been removed
                                        expect(tbDateEditor_errorMessages.count()).toBeLessThan(messageCount);
                                    });
                                });
                            });
                    })
                    .then(function () {
                        tbDateEditor_input.clear().then(function () {
                            tbDateEditor_input.sendKeys('06/11/2016').then(function () {
                                // Expect max chars error to be displayed
                                expect(tbDateEditor_errorMessages.count()).toBe(messageCount);
                            });
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbDateEditor_label.getText()).toMatch('Date Editor Date');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbDateEditor_helper.getText()).toMatch("Date help");
        });
        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbDateEditor_input.clear().then(function () {
                tbDateEditor_input.sendKeys('15/09/2016').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbDateEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch('15/09/2016');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbDateEditor_input.getAttribute('value').then(function (text) {
                expect(text).toMatch(tbDateEditorDate_original);
            })
            .then(function () {
                tbDateEditor_input.sendKeys('05/05/2016').then(function () {
                    tbFormCancelBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbDateEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch(tbDateEditorDate_original);
                            });
                        });
                    });
                });
            });
        });
    });

    describe('tbTypeaheadEditor', function () {
        beforeAll(function () {
            //* Assign test variables *\\
            // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa, Shipper City = Guadalajara ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first().$$('button').first();
            // tbSimpleEditor component and subcomponents
            tbTypeaheadEditor = $('div.modal-dialog form').$('tb-typeahead-editor');
            tbTypeaheadEditor_input = tbTypeaheadEditor.$('input');
            tbTypeaheadEditor_label = tbTypeaheadEditor.$('label');
            tbTypeaheadEditor_helper = $('div.modal-dialog form').$('tb-typeahead-editor').$$('span').filter(function (elem, index) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('help') != -1 : false;
                });
            }).first();
            tbTypeaheadEditor_errorMessages = tbTypeaheadEditor.all(by.repeater('error in state.$errors'));
            tbTypeaheadEditor_options = tbTypeaheadEditor.all(by.repeater('match in matches track by $index'));

            //* Restore default value and open form popup *\\
            tbTypeaheadEditorRestore().then(tbFormEditBtn1.click);
        });

        afterEach(function () {
            //* Restore default value and open form popup *\\
            tbTypeaheadEditorRestore().then(tbFormEditBtn1.click);
        });

        it('should show an options list when there is an API-info/component entered-data', function () {
            tbTypeaheadEditor_input.clear().then(function () {
                expect(tbTypeaheadEditor_options.count()).toBe(0);
            })
            .then(function () {
                tbTypeaheadEditor_input.sendKeys('l').then(function () {
                    expect(tbTypeaheadEditor_options.count()).toBeGreaterThan(0);
                });
            });
        });

        it('should select the option clicked', function () {
            tbTypeaheadEditor_input.clear().then(function () {
                tbTypeaheadEditor_input.sendKeys('la').then(function () {
                    // Select second option, should be "Portrland..."
                    tbTypeaheadEditor_options.get(1).click().then(function () {
                        expect(tbTypeaheadEditor_input.getAttribute('value')).toMatch('Portland, OR, USA');
                    });
                });
            });
        });

        it('should show a "delete" button when an option/match is seleted, and delete the option if button is clicked', function () {
            tbTypeaheadEditor_input.clear().then(function () {
                tbTypeaheadEditor_input.sendKeys('guad').then(function () {
                    tbTypeaheadEditor_options.first().click().then(function () {
                        // Evaluate button appearence
                        expect(tbTypeaheadEditor.$('span.input-group-btn button.btn-default i.fa.fa-times').isPresent())
                        .toBe(true);
                    })
                    .then(function () {
                        // Click button
                        tbTypeaheadEditor.$('span.input-group-btn button.btn-default').click().then(function () {
                            expect(tbTypeaheadEditor_input.getAttribute('value')).toBe('');
                        });
                    });
                });
            });
        });

        it('should show a label value equal to the component name when "showLabel" attribue is true', function () {
            expect(tbTypeaheadEditor_label.getText()).toMatch("Shipper City");
        });

        it('should require a value when "require" attribute is true', function () {
            var errorPresent = false;

            tbTypeaheadEditor_input.clear().then(function () {
                tbTypeaheadEditor_errorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        if (val == 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbTypeaheadEditor_input.clear().then(function () {
                tbTypeaheadEditor_input.sendKeys('por').then(function () {
                    tbTypeaheadEditor_options.first().click().then(function () {
                        tbFormSaveBtn.click().then(function () {
                            // Evaluate city was updated to Portland...
                            expect(element.all(by.repeater('row in $component.rows')).get(1).$$('td').get(5).getText())
                                .toMatch('Portland, OR, USA');
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbTypeaheadEditor_input.clear().then(function () {
                tbTypeaheadEditor_input.sendKeys('por').then(function () {
                    tbTypeaheadEditor_options.first().click().then(function () {
                        tbFormCancelBtn.click().then(function () {
                            // Evaluate city was NOT updated
                            expect(element.all(by.repeater('row in $component.rows')).get(1).$$('td').get(5).getText())
                                .toMatch('Guadalajara, JAL, Mexico');
                        });
                    });
                });
            });
        });

    });

    describe('tbSimpleEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 3rd element in list, should be: <OrderID = 3 , Customer Name = Unosquare LLC ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(2).$$('td').first().$$('button').first();
            // tbSimpleEditor component and subcomponents
            tbSimpleEditor = $('div.modal-dialog form').$('tb-simple-editor');
            tbSimpleEditor_input = $('div.modal-dialog form').$('tb-simple-editor').$('input');
            tbSimpleEditor_label = $('div.modal-dialog form').$('tb-simple-editor').$('label');
            tbSimpleEditor_errorMessages = $('div.modal-dialog form').$('tb-simple-editor').all(by.repeater('error in $ctrl.state.$errors'));
            tbSimpleEditor_helper = $('div.modal-dialog form').$('tb-simple-editor').$$('span').filter(function (elem, index) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();

            //* Restore default value and open form popup *\\
            tbSimpleEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });

        });

        afterEach(function () {
            //* Restore default value and open form popup *\\    
            tbSimpleEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });
        });

        it('should set initial input value to the value of "value" attribute when defined', function () {
            expect(tbSimpleEditor_input.getAttribute('value')).toMatch(tbSimpleEditorCustomer_original);
        });

        it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbSimpleEditor_input.clear().then(function () {
                // input 'kk' < 3chars
                tbSimpleEditor_input.sendKeys('kk').then(function () {
                    tbSimpleEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'The field needs to be minimum 3 chars.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbSimpleEditor_errorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbSimpleEditor_input.sendKeys('k').then(function () {
                                    // Expect min chars error to have been removed
                                    expect(tbSimpleEditor_errorMessages.count()).toBeLessThan(messageCount);
                                });
                            });
                    })
                    .then(function () {
                        tbSimpleEditor_input.sendKeys('kkkkkkkkkkkkk').then(function () {
                            // Expect max chars error to be displayed
                            expect(tbSimpleEditor_errorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbSimpleEditor_label.getText()).toMatch('Customer Name');
        });

        it('should set input placeholder to the value of "placeholder" attribute', function () {
            tbSimpleEditor_input.clear().then(function () {
                expect(tbSimpleEditor_input.getAttribute('placeholder')).toMatch('Enter Customer');
            });
        });

        it('should validate the control using the "regex" attribute, if present', function () {
            var errorPresent = false;

            tbSimpleEditor_input.clear().then(function () {
                tbSimpleEditor_input.sendKeys('1Unos', function () {
                    tbSimpleEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'Check regex') {
                                errorPresent = true;
                            }
                        });
                        // Expect regex error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                });
            });
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbSimpleEditor_helper.getText()).toMatch("This doesn't help at all");
        });

        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbSimpleEditor_input.clear().then(function () {
                tbSimpleEditor_errorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        if (val == 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbSimpleEditor_input.clear().then(function () {
                tbSimpleEditor_input.sendKeys('UNOS22').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbSimpleEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch('UNOS22');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbSimpleEditor_input.getAttribute('value').then(function (text) {
                expect(text).toMatch(tbSimpleEditorCustomer_original);
            })
            .then(function () {
                tbSimpleEditor_input.sendKeys('22').then(function () {
                    tbFormCancelBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbSimpleEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch(tbSimpleEditorCustomer_original);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('tbNumericEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 1st element in list, should be: <OrderID = 1 , Customer Name = Microsoft, Num Editor Test = 300 ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).first().$$('td').first().$$('button').first();
            // tbNumericEditor component and subcomponents
            tbNumericEditor = $('div.modal-dialog form').$('tb-numeric-editor');
            tbNumericEditor_input = tbNumericEditor.$('input');
            tbNumericEditor_label = tbNumericEditor.$('label');
            tbNumericEditor_helper = tbNumericEditor.$$('span').filter(function (elem, index) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();
            tbNumericEditor_errorMessages = tbNumericEditor.all(by.repeater('error in $ctrl.state.$errors'));

            //* Restore default value and open form popup *\\
            tbNumericEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });
        });

        afterEach(function () {
            //* Restore default value and open form popup *\\
            tbNumericEditorRestore().then(function () {
                tbFormEditBtn1.click();
            });
        });

        it('should set initial component value to the value of "value" attribute when defined', function () {
            expect(tbNumericEditor_input.getAttribute('value')).toMatch('300');
        });

        it('should be invalidated when the entered number is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbNumericEditor_input.clear().then(function () {
                // input '0'
                tbNumericEditor_input.sendKeys('0').then(function () {
                    tbNumericEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val == 'The minimum number is 1.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbNumericEditor_errorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbNumericEditor_input.clear().then(function () {
                                    tbNumericEditor_input.sendKeys('100').then(function () {
                                        // Expect min value error to have been removed
                                        expect(tbNumericEditor_errorMessages.count()).toBeLessThan(messageCount);
                                    });
                                });
                            });
                    })
                    .then(function () {
                        tbNumericEditor_input.sendKeys('0').then(function () {
                            // Expect max value error to be displayed
                            expect(tbNumericEditor_errorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbNumericEditor_label.getText()).toMatch('Num Editor Test');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbNumericEditor_helper.getText()).toMatch("Useless help");
        });

        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbNumericEditor_input.clear().then(function () {
                tbNumericEditor_errorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        if (val == 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbNumericEditor_input.clear().then(function () {
                tbNumericEditor_input.sendKeys('100').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbNumericEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch('100');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbNumericEditor_input.getAttribute('value').then(function (val) {
                expect(val).toMatch(tbNumericEditorValue_original);
            })
                .then(function () {
                    tbNumericEditor_input.sendKeys('220').then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbFormEditBtn1.click().then(function () {
                                tbNumericEditor_input.getAttribute('value').then(function (val) {
                                    expect(val).toMatch(tbNumericEditorValue_original);
                                });
                            });
                        });
                    });
                });
        });
    });
});
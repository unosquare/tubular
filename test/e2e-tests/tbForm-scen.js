/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,afterEach:false */

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
    var tbSimpleEditorInput,
        tbSimpleEditorLabel,
        tbSimpleEditorHelper,
        tbSimpleEditorErrorMessages,
        tbSimpleEditorCustomerOriginal = 'Unosquare LLC';

    var restoreCancelClickFn = function () {
        return tbFormCancelBtn.isPresent().then(function (present) { if (present) tbFormCancelBtn.click() });
    };

    var tbSimpleEditorRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn1.click().then(function () {
                return tbSimpleEditorInput.getAttribute('value').then(function (val) {
                    if (val !== tbSimpleEditorCustomerOriginal) {
                        return tbSimpleEditorInput.clear().then(function () {
                            return tbSimpleEditorInput.sendKeys(tbSimpleEditorCustomerOriginal).then(function () {
                                return tbFormSaveBtn.click().then(trueFunc);
                            });
                        });
                    } else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    }

    /************************/
    //  * tbNumericEditor * //
    /************************/
    var tbNumericEditor,
        tbNumericEditorInput,
        tbNumericEditorLabel,
        tbNumericEditorHelper,
        tbNumericEditorErrorMessages,
        tbNumericEditorValueOriginal = '300';

    var tbNumericEditorRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn1.click().then(function () {
                return tbNumericEditorInput.getAttribute('value').then(function (val) {
                    if (val !== tbNumericEditorValueOriginal) {
                        return tbNumericEditorInput.clear().then(function () {
                            return tbNumericEditorInput.sendKeys(tbNumericEditorValueOriginal).then(function () {
                                return tbFormSaveBtn.click().then(trueFunc);
                            });
                        });
                    }
                    else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    }

    /**************************/
    //  * tbTypeaheadEditor * //
    /**************************/
    var tbTypeaheadEditor,
        tbTypeaheadEditorInput,
        tbTypeaheadEditor_label,
        tbTypeaheadEditor_errorMessages,
        tbTypeaheadEditor_options,
        tbTypeaheadEditorCity_original = 'Guadalajara, JAL, Mexico',
        tbTypeaheadEditorCity_originalMatcher = 'Guad';


    var tbTypeaheadEditorRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn1.click().then(function () {
                return tbTypeaheadEditorInput.getAttribute('value').then(function (val) {
                    if (val !== tbTypeaheadEditorCity_original) {
                        return tbTypeaheadEditorInput.clear().then(function () {
                            return tbTypeaheadEditorInput.sendKeys(tbTypeaheadEditorCity_originalMatcher).then(function () {
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
        }));
    };

    /**************************/
    //    * tbDateEditor *    //
    /**************************/
    var tbDateEditorInput,
        tbDateEditor_label,
        tbDateEditor_helper,
        tbDateEditor_errorMessages,
        tbDateEditorDate_modified = '05/08/2016',
        tbDateEditorDate_original = '03/05/2016';

    var tbDateEditorRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn1.click().then(function () {
                return tbDateEditorInput.getAttribute('value').then(function (val) {
                    if (val != tbDateEditorDate_original) {
                        return tbDateEditorInput.clear().sendKeys(tbDateEditorDate_original).then(function () {
                            return tbFormSaveBtn.click().then(trueFunc);
                        });
                    }
                    else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    };

    var compareDates = function (a, b) {
        var currentValue = new Date(a);
        var currentDate = new Date(currentValue.getFullYear(), currentValue.getMonth(), currentValue.getDate(), 0, 0, 0, 0);
        var expectedValue = new Date(b);
        var expectedDate = new Date(expectedValue.getFullYear(), expectedValue.getMonth(), expectedValue.getDate(), 0, 0, 0, 0);
        return (currentDate.toDateString() === expectedDate.toDateString());
    };

    /**************************/
    //     * tbTextArea *     //
    /**************************/
    var tbTextArea,
        tbTextAreaInput,
        tbTextAreaLabel,
        tbTextAreaHelper,
        tbTextAreaErrorMessages,
        tbTextAreaCustomerOriginal = 'Microsoft';

    var tbTextAreaRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn2.click().then(function () {
                return tbTextAreaInput.getAttribute('value').then(function (val) {
                    if (val !== tbTextAreaCustomerOriginal) {
                        return tbTextAreaInput.clear().then(function () {
                            return tbTextAreaInput.sendKeys(tbTextAreaCustomerOriginal).then(function () {
                                return tbFormSaveBtn.click().then(trueFunc);
                            });
                        });
                    }
                    else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    };

    /****************************/
    //  * tbtbDropdownEditor *  //
    /****************************/
    var tbDropDownEditor,
        tbDropDownEditor_select,
        tbDropDownEditor_label,
        tbDropDownEditor_helper,
        tbDropDownEditorCityOriginal = 'string:Guadalajara, JAL, Mexico';

    function selectDropDownOption(filterText) {
        return tbDropDownEditor.$$('option').filter(function (elem) {
            return elem.getText().then(function (text) {
                return text.indexOf(filterText) != -1;
            });
        }).first();
    };

    var tbDropDownEditorRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn2.click().then(function () {
                return tbDropDownEditor_select.getAttribute('value').then(function (val) {
                    if (val != tbDropDownEditorCityOriginal) {
                        return selectDropDownOption('Guadalajara').click().then(function () {
                            return tbFormSaveBtn.click().then(trueFunc);
                        });
                    }
                    else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    };

    /****************************/
    //  * tbCheckboxField *  //
    /****************************/
    var tbCheckboxField,
        tbCheckboxFieldOnRow;

    var tbCheckboxFieldRestore = function () {
        return browser.wait(restoreCancelClickFn().then(function () {
            return tbFormEditBtn2.click().then(function () {
                return tbCheckboxField.getAttribute('class').then(function (val) {
                    if (val.indexOf('ng-empty') === -1) {
                        return tbCheckboxField.click().then(function () {
                            return tbFormSaveBtn.click().then(trueFunc);
                        });
                    }
                    else {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }
                });
            });
        }));
    };

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
        browser.executeScript('window.localStorage.clear();window.sessionStorage.clear()');
    });

    describe('tbCheckboxField', function () {
        beforeAll(function () {
            //* Assign test variables *\\
            // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa ... >
            tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first().$$('button').last();
            // tbDropDownEditor component and subcomponents
            tbCheckboxField = $('div.modal-dialog form').$('tb-checkbox-field').$('input[type="checkbox"]');
            tbCheckboxFieldOnRow = element.all(by.repeater('row in $component.rows'))
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
            tbCheckboxFieldOnRow.getAttribute('class').then(function (val) {
                expect(val.indexOf('ng-empty')).not.toBe(-1);
            })
            .then(function () {
                tbFormEditBtn2.click().then(function () {
                    tbCheckboxField.click().then(function () {
                        tbFormSaveBtn.click().then(function () {
                            tbCheckboxFieldOnRow.getAttribute('class').then(function (val) {
                                expect(val.indexOf('ng-empty')).toBe(-1);
                            });
                        });
                    });
                });
            });
        });

        it('should discard changes on "CANCEL"', function () {
            // Ensure field is unckecked
            tbCheckboxFieldOnRow.getAttribute('class').then(function (val) {
                expect(val.indexOf('ng-empty')).not.toBe(-1);
            })
            .then(function () {
                tbFormEditBtn2.click().then(function () {
                    tbCheckboxField.click().then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbCheckboxFieldOnRow.getAttribute('class').then(function (val) {
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
            tbDropDownEditor_helper = tbDropDownEditor.$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
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
            expect(tbDropDownEditor_select.getAttribute('value')).toMatch(tbDropDownEditorCityOriginal);
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbDropDownEditor_label.getText()).toMatch('Shipper City');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbDropDownEditor_helper.getText()).toMatch('dropdown help');
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbDropDownEditor_select.getAttribute('value').then(function (option) {
                expect(option).toMatch(tbDropDownEditorCityOriginal);
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
                expect(option).toMatch(tbDropDownEditorCityOriginal);
            })
                .then(function () {
                    selectDropDownOption('Portland').click().then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbFormEditBtn2.click().then(function () {
                                expect(tbDropDownEditor_select.getAttribute('value')).toMatch(tbDropDownEditorCityOriginal);
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
            tbTextArea = $('div.modal-dialog').$('tb-text-area');
            tbTextAreaInput = tbTextArea.$('textarea');
            tbTextAreaLabel = tbTextArea.$('label');
            tbTextAreaErrorMessages = tbTextArea.all(by.repeater('error in $ctrl.state.$errors'));
            tbTextAreaHelper = tbTextArea.$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
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
            expect(tbTextAreaInput.getAttribute('value')).toMatch(tbTextAreaCustomerOriginal);
        });

        it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbTextAreaInput.clear().then(function () {
                // input 'Mi' < 3chars
                tbTextAreaInput.sendKeys('Mi').then(function () {
                    tbTextAreaErrorMessages.getText().then(function (errorsArray) {
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
                        tbTextAreaErrorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbTextAreaInput.sendKeys('crosoft').then(function () {
                                    // Expect min chars error to have been removed
                                    expect(tbTextAreaErrorMessages.count()).toBeLessThan(messageCount);
                                });
                            });
                    })
                    .then(function () {
                        tbTextAreaInput.sendKeys('ss').then(function () {
                            // Expect max chars error to be displayed
                            expect(tbTextAreaErrorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbTextAreaLabel.getText()).toMatch('Customer Name');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbTextAreaHelper.getText()).toMatch('text area help');
        });

        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbTextAreaInput.clear().then(function () {
                tbTextAreaErrorMessages.getText()
                    .then(function(errorsArray) {
                        errorsArray.forEach(function(val) {
                            tbTextAreaInput.sendKeys(val);
                            if (val === 'The field is required.') {
                                errorPresent = true;
                            }
                        });
                        // Expect required error to display
                        expect(errorPresent).toBe(true);
                    });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbTextAreaInput.clear().then(function () {
                tbTextAreaInput.sendKeys('Apple').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn2.click().then(function () {
                            tbTextAreaInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch('Apple');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbTextAreaInput.getAttribute('value').then(function (text) {
                expect(text).toMatch(tbTextAreaCustomerOriginal);
            })
            .then(function () {
                tbTextAreaInput.sendKeys('Crocks').then(function () {
                    tbFormCancelBtn.click().then(function () {
                        tbFormEditBtn2.click().then(function () {
                            tbTextAreaInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch(tbTextAreaCustomerOriginal);
                            });
                        });
                    });
                });
            });
        });

    });

    describe('tbDateEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 4th element in list, should be: <OrderID = 4 , Customer Name = Unosquare LLC, Shipped Date = 1/30/16  ... >
            tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first().$$('button').first();
            tbDateEditorInput = $('tb-date-editor').$('input');
            tbDateEditor_label = $('div.modal-dialog form').$('tb-date-editor').$('label');
            tbDateEditor_errorMessages = $('div.modal-dialog form').$('tb-date-editor').all(by.repeater('error in $ctrl.state.$errors'));
            tbDateEditor_helper = $('div.modal-dialog form').$('tb-date-editor').$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
                });
            }).first();

            // Restore default value and open form popup
            tbDateEditorRestore().then(tbFormEditBtn1.click);
        });

        beforeEach(function () {
            tbDateEditorRestore().then(tbFormEditBtn1.click);
        });

        it('should set initial date value to the value of "value" attribute when defined', function () {
            tbDateEditorInput.getAttribute('value').then(function (value) {
                expect(compareDates(value, tbDateEditorDate_original)).toBe(true);
            });
        });

        it('should be invalidated when the date is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;
            tbDateEditorInput.clear().then(function () {
                // input  an invalid < min date
                tbDateEditorInput.sendKeys('02/20/2015').then(function () {
                    tbDateEditor_errorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val === 'The minimum date is 01/28/2016.') {
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
                                tbDateEditor_label.click();
                                tbDateEditorInput.clear().then(function () {
                                    tbDateEditorInput.sendKeys('05/08/2016').then(function () {
                                        // Expect min date error to have been removed
                                        expect(tbDateEditor_errorMessages.count()).toBeLessThan(messageCount);
                                    });
                                });
                            });
                    })
                    .then(function () {
                        tbDateEditorInput.clear().then(function () {
                            tbDateEditorInput.sendKeys('06/11/2016').then(function () {
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
            expect(tbDateEditor_helper.getText()).toMatch('Date help');
        });
        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbDateEditorInput.clear().sendKeys(tbDateEditorDate_modified).then(function () {
                tbFormSaveBtn.click().then(function () {
                    tbFormEditBtn1.click().then(function () {
                        tbDateEditorInput.getAttribute('value').then(function (value) {
                            expect(compareDates(tbDateEditorDate_modified, value)).toBe(true);
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbDateEditorInput.clear().sendKeys(tbDateEditorDate_modified).then(function () {
                tbFormCancelBtn.click().then(function () {
                    tbFormEditBtn1.click().then(function () {
                        tbDateEditorInput.getAttribute('value').then(function (value) {
                            expect(compareDates(tbDateEditorDate_original, value)).toBe(true);
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
            tbTypeaheadEditor = $('div.modal-dialog').$('tb-typeahead-editor');
            tbTypeaheadEditorInput = tbTypeaheadEditor.$('input');
            tbTypeaheadEditor_label = tbTypeaheadEditor.$('label');
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
            tbTypeaheadEditorInput.clear().then(function () {
                expect(tbTypeaheadEditor_options.count()).toBe(0);
            })
            .then(function () {
                tbTypeaheadEditorInput.sendKeys('l').then(function () {
                    expect(tbTypeaheadEditor_options.count()).toBeGreaterThan(0);
                });
            });
        });

        it('should select the option clicked', function () {
            tbTypeaheadEditorInput.clear().then(function () {
                tbTypeaheadEditorInput.sendKeys('la').then(function () {
                    // Select second option, should be "Portrland..."
                    tbTypeaheadEditor_options.get(1).click().then(function () {
                        expect(tbTypeaheadEditorInput.getAttribute('value')).toMatch('Portland, OR, USA');
                    });
                });
            });
        });

        it('should show a "delete" button when an option/match is selected, and delete the option if button is clicked', function () {
            tbTypeaheadEditorInput.clear().then(function () {
                tbTypeaheadEditorInput.sendKeys('guad').then(function () {
                    tbTypeaheadEditor_options.first().click().then(function () {
                        // Evaluate button appearence
                        expect(tbTypeaheadEditor.$('span.input-group-btn button.btn-default i.fa.fa-times').isPresent())
                        .toBe(true);
                    })
                    .then(function () {
                        // Click button
                        tbTypeaheadEditor.$('span.input-group-btn button.btn-default i.fa.fa-times').click().then(function () {
                            tbTypeaheadEditorInput.getAttribute('value').then(function (value) {
                                var x = value ? 'true' : 'false';
                                tbTypeaheadEditorInput.sendKeys(x).then(function () {
                                    expect(tbTypeaheadEditorInput.getAttribute('value')).toMatch('false');
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should show a label value equal to the component name when "showLabel" attribue is true', function () {
            expect(tbTypeaheadEditor_label.getText()).toMatch('Shipper City');
        });

        it('should require a value when "require" attribute is true', function () {
            var errorPresent = false;

            tbTypeaheadEditorInput.clear().then(function () {
                tbTypeaheadEditor_errorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        tbTypeaheadEditorInput.sendKeys(val);
                        if (val === 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbTypeaheadEditorInput.clear().then(function () {
                tbTypeaheadEditorInput.sendKeys('por').then(function () {
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
            tbTypeaheadEditorInput.clear().then(function () {
                tbTypeaheadEditorInput.sendKeys('por').then(function () {
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
            tbSimpleEditorInput = $('div.modal-dialog form').$('tb-simple-editor').$('input');
            tbSimpleEditorLabel = $('div.modal-dialog form').$('tb-simple-editor').$('label');
            tbSimpleEditorErrorMessages = $('div.modal-dialog form').$('tb-simple-editor').all(by.repeater('error in $ctrl.state.$errors'));
            tbSimpleEditorHelper = $('div.modal-dialog form').$('tb-simple-editor').$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
                });
            }).first();

            //* Restore default value and open form popup *\\
            tbSimpleEditorRestore().then(tbFormEditBtn1.click);
        });

        afterEach(function () {
            //* Restore default value and open form popup *\\    
            tbSimpleEditorRestore().then(tbFormEditBtn1.click);
        });

        it('should set initial input value to the value of "value" attribute when defined', function () {
            expect(tbSimpleEditorInput.getAttribute('value')).toMatch(tbSimpleEditorCustomerOriginal);
        });

        it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbSimpleEditorInput.clear().then(function () {
                // input 'kk' < 3chars
                tbSimpleEditorInput.sendKeys('kk').then(function () {
                    tbSimpleEditorErrorMessages.getText().then(function (errorsArray) {
                        errorsArray.forEach(function (val) {
                            if (val === 'The field needs to be minimum 3 chars.') {
                                errorPresent = true;
                            }
                        });
                        // Expect min chars error to be displayed
                        expect(errorPresent).toBe(true);
                    });
                })
                    .then(function () {
                        tbSimpleEditorErrorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbSimpleEditorInput.sendKeys('k').then(function () {
                                    // Expect min chars error to have been removed
                                    expect(tbSimpleEditorErrorMessages.count()).toBeLessThan(messageCount);
                                });
                            });
                    })
                    .then(function () {
                        tbSimpleEditorInput.sendKeys('kkkkkkkkkkkkk').then(function () {
                            // Expect max chars error to be displayed
                            expect(tbSimpleEditorErrorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbSimpleEditorLabel.getText()).toMatch('Customer Name');
        });

        it('should set input placeholder to the value of "placeholder" attribute', function () {
            tbSimpleEditorInput.clear().then(function () {
                tbSimpleEditorInput.sendKeys(tbSimpleEditorInput.getAttribute('placeholder'));
                expect(tbSimpleEditorInput.getAttribute('value')).toMatch('Enter Customer');
            });
        });

        it('should validate the control using the "regex" attribute, if present', function () {
            var errorPresent = false;

            tbSimpleEditorInput.clear().then(function () {
                tbSimpleEditorInput.sendKeys('1Unos').then(function () {

                    tbSimpleEditorErrorMessages.getText().then(function (errorsArray) {

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
            expect(tbSimpleEditorHelper.getText()).toMatch('This does not help at all');
        });


        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbSimpleEditorInput.clear().then(function () {
                tbSimpleEditorErrorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        tbSimpleEditorInput.sendKeys(val);
                        if (val === 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbSimpleEditorInput.clear().then(function () {
                tbSimpleEditorInput.sendKeys('UNOS22').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbSimpleEditorInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch('UNOS22');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbSimpleEditorInput.getAttribute('value').then(function (text) {
                expect(text).toMatch(tbSimpleEditorCustomerOriginal);
            })
            .then(function () {
                tbSimpleEditorInput.sendKeys('22').then(function () {
                    tbFormCancelBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbSimpleEditorInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch(tbSimpleEditorCustomerOriginal);
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
            tbNumericEditorInput = tbNumericEditor.$('input');
            tbNumericEditorLabel = tbNumericEditor.$('label');
            tbNumericEditorHelper = tbNumericEditor.$$('span').filter(function (elem) {
                return elem.getAttribute('ng-show').then(function (val) {
                    return val != null ? val.indexOf('$ctrl.help') != -1 : false;
                });
            }).first();
            tbNumericEditorErrorMessages = tbNumericEditor.all(by.repeater('error in $ctrl.state.$errors'));

            //* Restore default value and open form popup *\\
            tbNumericEditorRestore().then(tbFormEditBtn1.click);
        });

        afterEach(function () {
            //* Restore default value and open form popup *\\
            tbNumericEditorRestore().then(tbFormEditBtn1.click);
        });

        it('should set initial component value to the value of "value" attribute when defined', function () {
            expect(tbNumericEditorInput.getAttribute('value')).toMatch('300');
        });

        it('should be invalidated when the entered number is not in the range of "min" and "max" attributes', function () {
            var errorPresent = false;
            var messageCount;

            tbNumericEditorInput.clear().then(function () {
                // input '0'
                tbNumericEditorInput.sendKeys('0').then(function () {
                    tbNumericEditorErrorMessages.getText().then(function (errorsArray) {
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
                        tbNumericEditorErrorMessages.count().then(function (count) {
                            messageCount = count;
                        })
                            .then(function () {
                                tbNumericEditorInput.clear().then(function () {
                                    tbNumericEditorInput.sendKeys('100').then(function () {
                                        // Expect min value error to have been removed
                                        expect(tbNumericEditorErrorMessages.count()).toBeLessThan(messageCount);
                                    });
                                });
                            });
                    })
                    .then(function () {
                        tbNumericEditorInput.sendKeys('0').then(function () {
                            // Expect max value error to be displayed
                            expect(tbNumericEditorErrorMessages.count()).toBe(messageCount);
                        });
                    });
            });
        });

        it('should show the component name value in a label field when "showLabel" attribute is true', function () {
            expect(tbNumericEditorLabel.getText()).toMatch('Num Editor Test');
        });

        it('should show a help field equal to this attribute, is present', function () {
            expect(tbNumericEditorHelper.getText()).toMatch('Useless help');
        });

        it('should require the field when the attribute "required" is true', function () {
            var errorPresent = false;

            tbNumericEditorInput.clear().then(function () {
                tbNumericEditorErrorMessages.getText().then(function (errorsArray) {
                    errorsArray.forEach(function (val) {
                        var x = val === 'The field is required.' ? '1' : '0';
                        tbNumericEditorInput.sendKeys(x);
                        if (val === 'The field is required.') {
                            errorPresent = true;
                        }
                    });
                    // Expect required error to display
                    expect(errorPresent).toBe(true);
                });
            });
        });

        it('should submit modifications to item/server when clicking form "Save"', function () {
            tbNumericEditorInput.clear().then(function () {
                tbNumericEditorInput.sendKeys('100').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn1.click().then(function () {
                            tbNumericEditorInput.getAttribute('value').then(function (text) {
                                expect(text).toMatch('100');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbNumericEditorInput.getAttribute('value').then(function (val) {
                expect(val).toMatch(tbNumericEditorValueOriginal);
            })
                .then(function () {
                    tbNumericEditorInput.sendKeys('220').then(function () {
                        tbFormCancelBtn.click().then(function () {
                            tbFormEditBtn1.click().then(function () {
                                tbNumericEditorInput.getAttribute('value').then(function (val) {
                                    expect(val).toMatch(tbNumericEditorValueOriginal);
                                });
                            });
                        });
                    });
                });
        });
    });
});
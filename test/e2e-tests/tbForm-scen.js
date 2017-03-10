/* jshint: true */
/* globals: expect:false,beforeAll:false,expect:false,browser:false,element:false,by:false,describe:false,protractor:false,it:false,afterEach:false */

describe('tbForm related components', () => {
    var trueFunc = () => true;

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

    var restoreCancelClickFn = () => tbFormCancelBtn.isPresent().then(present => {
        if (present) tbFormCancelBtn.click();
    });

    var tbSimpleEditorRestore = () => browser.wait(restoreCancelClickFn().then(() =>
        tbFormEditBtn1.click().then(() =>
            tbSimpleEditorInput.getAttribute('value').then(val => {
                if (val !== tbSimpleEditorCustomerOriginal) {
                    return tbSimpleEditorInput.clear().then(() => tbSimpleEditorInput
                        .sendKeys(tbSimpleEditorCustomerOriginal)
                        .then(() => tbFormSaveBtn.click().then(trueFunc)));
                }

                return tbFormCancelBtn.click().then(trueFunc);
            })
        )));

    /************************/
    //  * tbNumericEditor * //
    /************************/
    var tbNumericEditor,
        tbNumericEditorInput,
        tbNumericEditorLabel,
        tbNumericEditorHelper,
        tbNumericEditorErrorMessages,
        tbNumericEditorValueOriginal = '300';

    function tbNumericEditorRestore() {
        return browser.wait(restoreCancelClickFn().then(() => tbFormEditBtn1.click().then(() => {
            return tbNumericEditorInput.getAttribute('value').then(val => {
                if (val !== tbNumericEditorValueOriginal) {
                    return tbNumericEditorInput.clear()
                        .then(() => tbNumericEditorInput.sendKeys(tbNumericEditorValueOriginal)
                            .then(() => tbFormSaveBtn.click().then(trueFunc)));
                }

                return tbFormCancelBtn.click().then(trueFunc);
            });
        })
        ));
    }

    /**************************/
    //  * tbTypeaheadEditor * //
    /**************************/
    var tbTypeaheadEditor,
        tbTypeaheadEditorInput,
        tbTypeaheadEditorLabel,
        tbTypeaheadEditorErrorMessages,
        tbTypeaheadEditorOptions,
        tbTypeaheadEditorCityOriginal;

    function tbTypeaheadEditorRestore() {
        return browser.wait(restoreCancelClickFn().then(() => {
            return tbFormEditBtn1.click().then(() => {
                return tbTypeaheadEditorInput.getAttribute('value').then(val => {
                    if (val === tbTypeaheadEditorCityOriginal) {
                        return tbFormCancelBtn.click().then(trueFunc);
                    }

                    return tbTypeaheadEditorInput.clear().then(() =>
                        tbTypeaheadEditorInput.sendKeys('Guad')
                        .then(() => tbTypeaheadEditorOptions.first().click()
                            .then(() => tbFormSaveBtn.click().then(trueFunc)))
                    );
                });
            });
        }));
    }

    /**************************/
    //    * tbDateEditor *    //
    /**************************/
    var tbDateEditorInput,
        tbDateEditorLabel,
        tbDateEditorHelper,
        tbDateEditorErrorMessages,
        tbDateEditorDateModified = '05/08/2016',
        tbDateEditorDateOriginal = '03/05/2016';

    function tbDateEditorRestore() {
        return browser.wait(restoreCancelClickFn().then(() => tbFormEditBtn1.click().then(() => {
            return tbDateEditorInput.getAttribute('value').then(val => {
                if (val !== tbDateEditorDateOriginal) {
                    return tbDateEditorInput.clear().sendKeys(tbDateEditorDateOriginal)
                        .then(() => tbFormSaveBtn.click().then(trueFunc));
                }

                return tbFormCancelBtn.click().then(trueFunc);
            });
        })));
    }

    function compareDates(a, b) {
        var currentValue = new Date(a);
        var currentDate = new Date(currentValue.getFullYear(),
            currentValue.getMonth(),
            currentValue.getDate(),
            0,
            0,
            0,
            0);
        var expectedValue = new Date(b);
        var expectedDate = new Date(expectedValue.getFullYear(),
            expectedValue.getMonth(),
            expectedValue.getDate(),
            0,
            0,
            0,
            0);
        return (currentDate.toDateString() === expectedDate.toDateString());
    }

    /**************************/
    //     * tbTextArea *     //
    /**************************/
    var tbTextArea,
        tbTextAreaInput,
        tbTextAreaLabel,
        tbTextAreaHelper,
        tbTextAreaErrorMessages,
        tbTextAreaCustomerOriginal = 'Microsoft';

    function tbTextAreaRestore() {
        return browser.wait(restoreCancelClickFn().then(() => tbFormEditBtn2.click().then(() => {
            return tbTextAreaInput.getAttribute('value').then(val => {
                if (val !== tbTextAreaCustomerOriginal) {
                    return tbTextAreaInput.clear().then(() => {
                        return tbTextAreaInput.sendKeys(tbTextAreaCustomerOriginal)
                            .then(() => tbFormSaveBtn.click().then(trueFunc));
                    });
                }

                return tbFormCancelBtn.click().then(trueFunc);
            });
        })));
    }

    /****************************/
    //  * tbtbDropdownEditor *  //
    /****************************/
    var tbDropDownEditor,
        tbDropDownEditorSelect,
        tbDropDownEditorLabel,
        tbDropDownEditorHelper,
        tbDropDownEditorCityOriginal = 'string:Guadalajara, JAL, Mexico';

    function selectDropDownOption(filterText) {
        return tbDropDownEditor.$$('option').filter(elem => elem.getText()
            .then(text => text.indexOf(filterText) !== -1)).first();
    }

    function tbDropDownEditorRestore() {
        return browser.wait(restoreCancelClickFn().then(() => {
            return tbFormEditBtn2.click().then(() => {
                return tbDropDownEditorSelect.getAttribute('value').then(val => {
                    if (val !== tbDropDownEditorCityOriginal) {
                        return selectDropDownOption('Guadalajara').click()
                            .then(() => tbFormSaveBtn.click().then(trueFunc));
                    }

                    return tbFormCancelBtn.click().then(trueFunc);
                });
            });
        }));
    }

    /****************************/
    //  * tbCheckboxField *  //
    /****************************/
    var tbCheckboxField,
        tbCheckboxFieldOnRow;

    var tbCheckboxFieldRestore = () => browser.wait(restoreCancelClickFn().then(() => {
        return tbFormEditBtn2.click().then(() => {
            return tbCheckboxField.getAttribute('class').then(val => {
                if (val.indexOf('ng-empty') === -1) {
                    return tbCheckboxField.click().then(() => tbFormSaveBtn.click().then(trueFunc));
                }

                return tbFormCancelBtn.click().then(trueFunc);
            });
        });
    }));

    beforeAll(() => {
        browser.get('index.html');
        element(by.id('testsSelector')).click();

        element(by.id('tbFormTest')).click().then(() => {
            // Save and Cancel buttons
            tbFormSaveBtn = $('div.modal-dialog form').$('#btnSave');
            tbFormCancelBtn = $('div.modal-dialog form').$('#btnCancel');
        });
    });

    beforeEach(() => {
        browser.executeScript('window.localStorage.clear();window.sessionStorage.clear()');
    });

    describe('tbCheckboxField',
        () => {
            beforeAll(() => {
                //* Assign test variables *\\
                // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa ... >
                tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first()
                    .$$('button').last();
                // tbDropDownEditor component and subcomponents
                tbCheckboxField = $('div.modal-dialog form').$('tb-checkbox-field').$('input[type="checkbox"]');
                tbCheckboxFieldOnRow = element.all(by.repeater('row in $component.rows'))
                    .get(1).$$('td').last().$('input[type="checkbox"]');

                //* Restore default value *\\
                tbCheckboxFieldRestore();
            });

            afterEach(() => {
                //* Restore default value *\\    
                tbCheckboxFieldRestore();
            });

            it('should save changes on "SAVE"',
                done => {
                    // Ensure field is unckecked
                    tbCheckboxFieldOnRow.getAttribute('class')
                        .then(val => {
                            expect(val.indexOf('ng-empty')).not.toBe(-1);

                            tbFormEditBtn2.click().then(() => {
                                tbCheckboxField.click().then(() => {
                                    tbFormSaveBtn.click().then(() => {
                                        tbCheckboxFieldOnRow.getAttribute('class').then(val => {
                                            expect(val.indexOf('ng-empty')).toBe(-1);
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                });

            it('should discard changes on "CANCEL"',
                done => {
                    // Ensure field is unckecked
                    tbCheckboxFieldOnRow.getAttribute('class')
                        .then(val => {
                            expect(val.indexOf('ng-empty')).not.toBe(-1);

                            tbFormEditBtn2.click().then(() => {
                                tbCheckboxField.click().then(() => {
                                    tbFormCancelBtn.click().then(() => {
                                        tbCheckboxFieldOnRow.getAttribute('class').then(val => {
                                            expect(val.indexOf('ng-empty')).not.toBe(-1);
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                });

        });

    describe('tbDropDownEditor',
        () => {

            beforeAll(() => {
                //* Assign test variables *\\
                // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa ... >
                tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first()
                    .$$('button').last();
                // tbDropDownEditor component and subcomponents
                tbDropDownEditor = $('div.modal-dialog form').$('tb-dropdown-editor');
                tbDropDownEditorSelect = tbDropDownEditor.$('select');
                tbDropDownEditorLabel = tbDropDownEditor.$('label');
                tbDropDownEditorHelper = tbDropDownEditor.$$('span').filter(elem =>
                    elem.getAttribute('ng-show').then(val => val != null ? val.indexOf('$ctrl.help') !== -1 : false)
                ).first();

                //* Restore default value and open form popup *\\
                tbDropDownEditorRestore().then(tbFormEditBtn2.click);
            });

            // Restore default value and open form popup
            afterEach(() => tbDropDownEditorRestore().then(tbFormEditBtn2.click));

            it('should set initial input value to the value of "value" attribute when defined',
                () => expect(tbDropDownEditorSelect.getAttribute('value')).toMatch(tbDropDownEditorCityOriginal));

            it('should show the component name value in a label field when "showLabel" attribute is true',
                () => expect(tbDropDownEditorLabel.getText()).toMatch('Shipper City'));

            it('should show a help field equal to this attribute, is present',
                () => expect(tbDropDownEditorHelper.getText()).toMatch('dropdown help'));

            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbDropDownEditorSelect.getAttribute('value')
                        .then(option => {
                            expect(option).toMatch(tbDropDownEditorCityOriginal);

                            selectDropDownOption('Portland').click().then(() => {
                                tbFormSaveBtn.click().then(() => {
                                    tbFormEditBtn2.click().then(() => {
                                        expect(tbDropDownEditorSelect.getAttribute('value'))
                                            .toMatch('string:Portland, OR, USA');
                                    });
                                });
                            });
                        });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                () => {
                    tbDropDownEditorSelect.getAttribute('value')
                        .then(option => {
                            expect(option).toMatch(tbDropDownEditorCityOriginal);

                            selectDropDownOption('Portland').click().then(() => {
                                tbFormCancelBtn.click().then(() => {
                                    tbFormEditBtn2.click().then(() => {
                                        expect(tbDropDownEditorSelect.getAttribute('value'))
                                            .toMatch(tbDropDownEditorCityOriginal);
                                    });
                                });
                            });
                        });
                });
        });

    describe('tbTextArea',
        () => {

            beforeAll(() => {
                //* Assign test variables *\\
                // 1st element in list, should be: <OrderID = 1 , Customer Name = Microsoft ... >
                tbFormEditBtn2 = element.all(by.repeater('row in $component.rows')).first().$$('td').first()
                    .$$('button').last();
                // tbTextArea component and subcomponents
                tbTextArea = $('div.modal-dialog').$('tb-text-area');
                tbTextAreaInput = tbTextArea.$('textarea');
                tbTextAreaLabel = tbTextArea.$('label');
                tbTextAreaErrorMessages = tbTextArea.all(by.repeater('error in $ctrl.state.$errors'));
                tbTextAreaHelper = tbTextArea.$$('span').filter(elem => elem.getAttribute('ng-show').then(val => {
                    return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
                })).first();

                //* Restore default value and open form popup *\\
                tbTextAreaRestore().then(tbFormEditBtn2.click);
            });

            // Restore default value and open form popup
            afterEach(() => tbTextAreaRestore().then(tbFormEditBtn2.click));

            it('should set initial input value to the value of "value" attribute when defined',
                () => expect(tbTextAreaInput.getAttribute('value')).toMatch(tbTextAreaCustomerOriginal));

            it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes',
                () => {
                    var errorPresent = false;
                    var messageCount;

                    tbTextAreaInput.clear().then(() => {
                        // input 'Mi' < 3chars
                        tbTextAreaInput.sendKeys('Mi').then(() => {
                            tbTextAreaErrorMessages.getText().then(errorsArray => {
                                errorsArray.forEach(val => {
                                    if (val === 'The field needs to be minimum 3 chars.') {
                                        errorPresent = true;
                                    }
                                });
                                // Expect min chars error to be displayed
                                expect(errorPresent).toBe(true);
                            });
                        })
                            .then(() => {
                                tbTextAreaErrorMessages.count().then(count => messageCount = count)
                                    .then(() => {
                                        tbTextAreaInput.sendKeys('crosoft').then(() => {
                                            // Expect min chars error to have been removed
                                            expect(tbTextAreaErrorMessages.count()).toBeLessThan(messageCount);
                                        });
                                    });
                            })
                            .then(() => {
                                tbTextAreaInput.sendKeys('ss').then(() => {
                                    // Expect max chars error to be displayed
                                    expect(tbTextAreaErrorMessages.count()).toBe(messageCount);
                                });
                            });
                    });
                });

            it('should show the component name value in a label field when "showLabel" attribute is true',
                () => {
                    expect(tbTextAreaLabel.getText()).toMatch('Customer Name');
                });

            it('should show a help field equal to this attribute, is present',
                () => {
                    expect(tbTextAreaHelper.getText()).toMatch('text area help');
                });

            it('should require the field when the attribute "required" is true',
                () => {
                    var errorPresent = false;

                    tbTextAreaInput.clear().then(() => {
                        tbTextAreaErrorMessages.getText()
                            .then(errorsArray => {
                                errorsArray.forEach(val => {
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

            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbTextAreaInput.clear().then(() => {
                        tbTextAreaInput.sendKeys('Apple').then(() => {
                            tbFormSaveBtn.click().then(() => {
                                tbFormEditBtn2.click().then(() => {
                                    tbTextAreaInput.getAttribute('value').then(text => {
                                        expect(text).toMatch('Apple');
                                    });
                                });
                            });
                        });
                    });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                () => {
                    tbTextAreaInput.getAttribute('value')
                        .then(text => expect(text).toMatch(tbTextAreaCustomerOriginal))
                        .then(() => {
                            tbTextAreaInput.sendKeys('Crocks').then(() => {
                                tbFormCancelBtn.click().then(() => {
                                    tbFormEditBtn2.click().then(() => {
                                        tbTextAreaInput.getAttribute('value').then(text => {
                                            expect(text).toMatch(tbTextAreaCustomerOriginal);
                                        });
                                    });
                                });
                            });
                        });
                });
        });

    describe('tbDateEditor',
        () => {

            beforeAll(() => {
                //* Assign test variables *\\
                // 4th element in list, should be: <OrderID = 4 , Customer Name = Unosquare LLC, Shipped Date = 1/30/16  ... >
                tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first()
                    .$$('button').first();
                tbDateEditorInput = $('tb-date-editor').$('input');
                tbDateEditorLabel = $('div.modal-dialog form').$('tb-date-editor').$('label');
                tbDateEditorErrorMessages = $('div.modal-dialog form').$('tb-date-editor')
                    .all(by.repeater('error in $ctrl.state.$errors'));
                tbDateEditorHelper = $('div.modal-dialog form').$('tb-date-editor').$$('span').filter(elem => {
                    return elem.getAttribute('ng-show').then(val => {
                        return val != null ? val.indexOf('$ctrl.help') !== -1 : false;
                    });
                }).first();

                // Restore default value and open form popup
                tbDateEditorRestore().then(tbFormEditBtn1.click);
            });

            beforeEach(() => tbDateEditorRestore().then(tbFormEditBtn1.click));

            it('should set initial date value to the value of "value" attribute when defined',
                done => {
                    tbDateEditorInput.getAttribute('value').then(val => {
                        expect(compareDates(val, tbDateEditorDateOriginal)).toBe(true);
                        done();
                    });
                });

            it('should be invalidated when the date is not in the range of "min" and "max" attributes',
                done => {
                    var errorPresent = false;
                    var messageCount;

                    tbDateEditorInput.clear().then(() => {
                        // input  an invalid < min date
                        tbDateEditorInput.sendKeys('02/20/2015').then(() => {
                            tbDateEditorErrorMessages.getText().then(errorsArray => {
                                errorsArray.forEach(val => {
                                    if (val === 'The minimum date is 01/28/2016.') {
                                        errorPresent = true;
                                    }
                                });
                                // Expect min chars error to be displayed
                                expect(errorPresent).toBe(true);
                            });
                        })
                            .then(() => {
                                tbDateEditorErrorMessages.count().then(count => messageCount = count)
                                    .then(() => {
                                        tbDateEditorLabel.click();
                                        tbDateEditorInput.clear().then(() => {
                                            tbDateEditorInput.sendKeys('05/08/2016').then(() => {
                                                // Expect min date error to have been removed
                                                expect(tbDateEditorErrorMessages.count())
                                                    .toBeLessThan(messageCount);
                                            });
                                        });
                                    });
                            })
                            .then(() => {
                                tbDateEditorInput.clear().then(() => {
                                    tbDateEditorInput.sendKeys('06/11/2016').then(() => {
                                        // Expect max chars error to be displayed
                                        expect(tbDateEditorErrorMessages.count()).toBe(messageCount);
                                        done();
                                    });
                                });
                            });
                    });
                });

            it('should show the component name value in a label field when "showLabel" attribute is true',
                () => {
                    expect(tbDateEditorLabel.getText()).toMatch('Date Editor Date');
                });

            it('should show a help field equal to this attribute, is present',
                () => {
                    expect(tbDateEditorHelper.getText()).toMatch('Date help');
                });
            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbDateEditorInput.clear().sendKeys(tbDateEditorDateModified).then(() => {
                        tbFormSaveBtn.click().then(() => {
                            tbFormEditBtn1.click().then(() => {
                                tbDateEditorInput.getAttribute('value')
                                    .then(value => expect(compareDates(tbDateEditorDateModified, value))
                                        .toBe(true));
                            });
                        });
                    });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                done => {
                    tbDateEditorInput.clear().sendKeys(tbDateEditorDateModified).then(() => {
                        tbFormCancelBtn.click().then(() => {
                            tbFormEditBtn1.click().then(() => {
                                tbDateEditorInput.getAttribute('value').then(value => {
                                    expect(compareDates(tbDateEditorDateOriginal, value)).toBe(true);
                                    done();
                                });
                            });
                        });
                    });
                });
        });

    describe('tbTypeaheadEditor',
        () => {
            beforeAll(() => {
                //* Assign test variables *\\
                // 2d element in list, should be: <OrderID = 2 , Customer Name = Super La Playa, Shipper City = Guadalajara ... >
                tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(1).$$('td').first()
                    .$$('button').first();
                // tbSimpleEditor component and subcomponents
                tbTypeaheadEditor = $('div.modal-dialog').$('tb-typeahead-editor');
                tbTypeaheadEditorInput = tbTypeaheadEditor.$('input');
                tbTypeaheadEditorLabel = tbTypeaheadEditor.$('label');
                tbTypeaheadEditorErrorMessages = tbTypeaheadEditor.all(by.repeater('error in state.$errors'));
                tbTypeaheadEditorOptions = tbTypeaheadEditor.all(by.repeater('match in matches track by $index'));

                //* Restore default value and open form popup *\\
                tbTypeaheadEditorRestore().then(tbFormEditBtn1.click);
            });

            // Restore default value and open form popup
            afterEach(() => tbTypeaheadEditorRestore().then(tbFormEditBtn1.click));

            it('should show an options list when there is an API-info/component entered-data',
                done => {
                    tbTypeaheadEditorInput.clear()
                        .then(() => {
                            expect(tbTypeaheadEditorOptions.count()).toBe(0);

                            tbTypeaheadEditorInput.sendKeys('l').then(() => {
                                expect(tbTypeaheadEditorOptions.count()).toBeGreaterThan(0);
                                done();
                            });
                        });
                });

            it('should select the option clicked',
                () => {
                    tbTypeaheadEditorInput.clear().then(() => {
                        tbTypeaheadEditorInput.sendKeys('la').then(() => {
                            // Select second option, should be "Portrland..."
                            tbTypeaheadEditorOptions.get(1).click().then(() => {
                                expect(tbTypeaheadEditorInput.getAttribute('value')).toMatch('Portland, OR, USA');
                            });
                        });
                    });
                });

            it('should show a "delete" button when an option/match is selected, and delete the option if button is clicked',
                () => {
                    tbTypeaheadEditorInput.clear().then(() => {
                        tbTypeaheadEditorInput.sendKeys('guad').then(() => {
                            tbTypeaheadEditorOptions.first().click().then(() => {
                                // Evaluate button appearence
                                expect(tbTypeaheadEditor
                                        .$('span.input-group-btn button.btn-default i.fa.fa-times').isPresent())
                                    .toBe(true);
                            })
                                .then(() => {
                                    // Click button
                                    tbTypeaheadEditor.$('span.input-group-btn button.btn-default i.fa.fa-times')
                                        .click().then(() => {
                                            tbTypeaheadEditorInput.getAttribute('value').then(val => {
                                                tbTypeaheadEditorInput.sendKeys(val ? 'true' : 'false').then(() => {
                                                    expect(tbTypeaheadEditorInput.getAttribute('value'))
                                                        .toMatch('false');
                                                });
                                            });
                                        });
                                });
                        });
                    });
                });

            it('should show a label value equal to the component name when "showLabel" attribute is true',
                () => expect(tbTypeaheadEditorLabel.getText()).toMatch('Shipper City'));

            it('should require a value when "require" attribute is true',
                () => {
                    var errorPresent = false;

                    tbTypeaheadEditorInput.clear().then(() => {
                        tbTypeaheadEditorErrorMessages.getText().then(errorsArray => {
                            errorsArray.forEach(val => {
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

            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbTypeaheadEditorInput.clear().then(() => {
                        tbTypeaheadEditorInput.sendKeys('por').then(() => {
                            tbTypeaheadEditorOptions.first().click().then(() => {
                                tbFormSaveBtn.click().then(() => {
                                    // Evaluate city was updated to Portland...
                                    expect(element.all(by.repeater('row in $component.rows')).get(1).$$('td').get(5)
                                            .getText())
                                        .toMatch('Portland, OR, USA');
                                });
                            });
                        });
                    });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                () => {
                    tbTypeaheadEditorInput.clear().then(() => {
                        tbTypeaheadEditorInput.sendKeys('por').then(() => {
                            tbTypeaheadEditorOptions.first().click().then(() => {
                                tbFormCancelBtn.click().then(() => {
                                    // Evaluate city was NOT updated
                                    expect(element.all(by.repeater('row in $component.rows')).get(1).$$('td').get(5)
                                            .getText())
                                        .toMatch('Guadalajara, JAL, Mexico');
                                });
                            });
                        });
                    });
                });

        });

    describe('tbSimpleEditor',
        () => {

            beforeAll(() => {
                //* Assign test variables *\\
                // 3rd element in list, should be: <OrderID = 3 , Customer Name = Unosquare LLC ... >
                tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).get(2).$$('td').first()
                    .$$('button').first();
                // tbSimpleEditor component and subcomponents
                tbSimpleEditorInput = $('div.modal-dialog form').$('tb-simple-editor').$('input');
                tbSimpleEditorLabel = $('div.modal-dialog form').$('tb-simple-editor').$('label');
                tbSimpleEditorErrorMessages = $('div.modal-dialog form').$('tb-simple-editor')
                    .all(by.repeater('error in $ctrl.state.$errors'));
                tbSimpleEditorHelper = $('div.modal-dialog form').$('tb-simple-editor').$$('span').filter(elem => {
                    return elem.getAttribute('ng-show').then(val => val != null ? val.indexOf('$ctrl.help') !== -1 : false);
                }).first();

                //* Restore default value and open form popup *\\
                tbSimpleEditorRestore().then(tbFormEditBtn1.click);
            });

            // Restore default value and open form popup
            afterEach(() => tbSimpleEditorRestore().then(tbFormEditBtn1.click));

            it('should set initial input value to the value of "value" attribute when defined',
                () => expect(tbSimpleEditorInput.getAttribute('value')).toMatch(tbSimpleEditorCustomerOriginal));

            it('should be invalidated when the number of chars is not in the range of "min" and "max" attributes',
                () => {
                    var errorPresent = false;
                    var messageCount;

                    tbSimpleEditorInput.clear().then(() => {
                        // input 'kk' < 3chars
                        tbSimpleEditorInput.sendKeys('kk').then(() => {
                            tbSimpleEditorErrorMessages.getText().then(errorsArray => {
                                errorsArray.forEach(val => {
                                    if (val === 'The field needs to be minimum 3 chars.') {
                                        errorPresent = true;
                                    }
                                });
                                // Expect min chars error to be displayed
                                expect(errorPresent).toBe(true);
                            });
                        })
                            .then(() => {
                                tbSimpleEditorErrorMessages.count()
                                    .then(count => messageCount = count)
                                    .then(() => {
                                        tbSimpleEditorInput.sendKeys('k').then(() => {
                                            // Expect min chars error to have been removed
                                            expect(tbSimpleEditorErrorMessages.count()).toBeLessThan(messageCount);
                                        });
                                    });
                            })
                            .then(() => {
                                tbSimpleEditorInput.sendKeys('kkkkkkkkkkkkk').then(() => {
                                    // Expect max chars error to be displayed
                                    expect(tbSimpleEditorErrorMessages.count()).toBe(messageCount);
                                });
                            });
                    });
                });

            it('should show the component name value in a label field when "showLabel" attribute is true',
                () => expect(tbSimpleEditorLabel.getText()).toMatch('Customer Name'));

            it('should set input placeholder to the value of "placeholder" attribute',
                () => {
                    tbSimpleEditorInput.clear().then(() => {
                        tbSimpleEditorInput.sendKeys(tbSimpleEditorInput.getAttribute('placeholder'));
                        expect(tbSimpleEditorInput.getAttribute('value')).toMatch('Enter Customer');
                    });
                });

            it('should validate the control using the "regex" attribute, if present',
                done => {
                    var errorPresent = false;

                    tbSimpleEditorInput.clear().then(() => {
                        tbSimpleEditorInput.sendKeys('1Unos').then(() =>
                            tbSimpleEditorErrorMessages.getText().then(errorsArray => {
                                errorsArray.forEach(val => {
                                    if (val === 'Check regex') {
                                        errorPresent = true;
                                    }
                                });

                                // Expect regex error to be displayed
                                expect(errorPresent).toBe(true);
                                done();
                            }));
                    });
                });

            it('should show a help field equal to this attribute, is present',
                () => expect(tbSimpleEditorHelper.getText()).toMatch('This does not help at all'));

            it('should require the field when the attribute "required" is true',
                done => {
                    var errorPresent = false;

                    tbSimpleEditorInput.clear().then(() => {
                        tbSimpleEditorErrorMessages.getText().then(errorsArray => {
                            errorsArray.forEach(val => {
                                tbSimpleEditorInput.sendKeys(val);
                                if (val === 'The field is required.') {
                                    errorPresent = true;
                                }
                            });

                            // Expect required error to display
                            expect(errorPresent).toBe(true);
                            done();
                        });
                    });
                });

            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbSimpleEditorInput.clear().then(() => {
                        tbSimpleEditorInput.sendKeys('UNOS22').then(() => {
                            tbFormSaveBtn.click().then(() => {
                                tbFormEditBtn1.click().then(() => {
                                    tbSimpleEditorInput.getAttribute('value')
                                        .then(text => expect(text).toMatch('UNOS22'));
                                });
                            });
                        });
                    });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                () => {
                    tbSimpleEditorInput.getAttribute('value')
                        .then(text => {
                            expect(text).toMatch(tbSimpleEditorCustomerOriginal);

                            tbSimpleEditorInput.sendKeys('22').then(() =>
                                tbFormCancelBtn.click().then(() =>
                                    tbFormEditBtn1.click().then(() =>
                                        tbSimpleEditorInput.getAttribute('value')
                                        .then(ntext => expect(ntext).toMatch(tbSimpleEditorCustomerOriginal)))
                                )
                            );
                        }
                        );
                });
        });

    describe('tbNumericEditor',
        () => {

            beforeAll(() => {
                //* Assign test variables *\\
                // 1st element in list, should be: <OrderID = 1 , Customer Name = Microsoft, Num Editor Test = 300 ... >
                tbFormEditBtn1 = element.all(by.repeater('row in $component.rows')).first().$$('td').first()
                    .$$('button').first();
                // tbNumericEditor component and subcomponents
                tbNumericEditor = $('div.modal-dialog form').$('tb-numeric-editor');
                tbNumericEditorInput = tbNumericEditor.$('input');
                tbNumericEditorLabel = tbNumericEditor.$('label');
                tbNumericEditorHelper = tbNumericEditor.$$('span').filter(elem => {
                    return elem.getAttribute('ng-show')
                        .then(val => val != null ? val.indexOf('$ctrl.help') !== -1 : false);
                }).first();
                tbNumericEditorErrorMessages = tbNumericEditor.all(by.repeater('error in $ctrl.state.$errors'));

                //* Restore default value and open form popup *\\
                tbNumericEditorRestore().then(tbFormEditBtn1.click);
            });

            // Restore default value and open form popup
            afterEach(() => tbNumericEditorRestore().then(tbFormEditBtn1.click));

            it('should set initial component value to the value of "value" attribute when defined',
                () => expect(tbNumericEditorInput.getAttribute('value')).toMatch('300'));

            it('should be invalidated when the entered number is not in the range of "min" and "max" attributes',
                done => {
                    var errorPresent = false;
                    var messageCount;

                    tbNumericEditorInput.clear().then(() => {
                        // input '0'
                        tbNumericEditorInput.sendKeys('0').then(() => {
                            tbNumericEditorErrorMessages.getText().then(errorsArray => {
                                errorsArray.forEach(val => {
                                    if (val === 'The minimum number is 1.') {
                                        errorPresent = true;
                                    }
                                });
                                // Expect min chars error to be displayed
                                expect(errorPresent).toBe(true);
                            });
                        })
                            .then(() => {
                                tbNumericEditorErrorMessages.count()
                                    .then(count => {
                                        messageCount = count;

                                        tbNumericEditorInput.clear().then(() => {
                                            tbNumericEditorInput.sendKeys('100').then(() => {
                                                // Expect min value error to have been removed
                                                expect(tbNumericEditorErrorMessages.count())
                                                    .toBeLessThan(messageCount);
                                            });
                                        });
                                    });
                            })
                            .then(() => {
                                // Expect max value error to be displayed
                                tbNumericEditorInput.sendKeys('0')
                                    .then(() => expect(tbNumericEditorErrorMessages.count()).toBe(messageCount));
                                done();
                            });
                    });
                });

            it('should show the component name value in a label field when "showLabel" attribute is true',
                () => {
                    expect(tbNumericEditorLabel.getText()).toMatch('Num Editor Test');
                });

            it('should show a help field equal to this attribute, is present',
                () => {
                    expect(tbNumericEditorHelper.getText()).toMatch('Useless help');
                });

            it('should require the field when the attribute "required" is true',
                done => {
                    var errorPresent = false;

                    tbNumericEditorInput.clear().then(() => {
                        tbNumericEditorErrorMessages.getText().then(errorsArray => {
                            errorsArray.forEach(val => {
                                tbNumericEditorInput.sendKeys(val === 'The field is required.' ? '1' : '0');

                                if (val === 'The field is required.') {
                                    errorPresent = true;
                                }
                            });
                            // Expect required error to display
                            expect(errorPresent).toBe(true);
                            done();
                        });
                    });
                });

            it('should submit modifications to item/server when clicking form "Save"',
                () => {
                    tbNumericEditorInput.clear().then(() => {
                        tbNumericEditorInput.sendKeys('100').then(() => {
                            tbFormSaveBtn.click().then(() => {
                                tbFormEditBtn1.click().then(() => {
                                    tbNumericEditorInput.getAttribute('value')
                                        .then(text => expect(text).toMatch('100'));
                                });
                            });
                        });
                    });
                });

            it('should NOT submit modifications to item/server when clicking form "Cancel"',
                done => {
                    tbNumericEditorInput.getAttribute('value')
                        .then(val => {
                            expect(val).toMatch(tbNumericEditorValueOriginal);

                            tbNumericEditorInput.sendKeys('220').then(() => {
                                tbFormCancelBtn.click().then(() => {
                                    tbFormEditBtn1.click().then(() => {
                                        tbNumericEditorInput.getAttribute('value').then(val => {
                                            expect(val).toMatch(tbNumericEditorValueOriginal);
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                });
        });
});
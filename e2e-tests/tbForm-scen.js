describe('tbForm related components ->', function () {

        /**********************/
        // *     Global     * //
        /**********************/
    var tbFormEditBtn,
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
        originalCustomerName = 'Unosquare LLC';

    var tbSimpleEditorRestore = function () {
        return browser.wait(function () {
           return tbFormCancelBtn.isPresent().then(function (present) {
                if (present) {
                    tbFormCancelBtn.click();
                }
            }).then(function () {
                return tbFormEditBtn.click().then(function () {
                    return tbSimpleEditor_input.getAttribute('value').then(function (val) {
                        if (val != originalCustomerName) {
                            return tbSimpleEditor_input.clear().then(function () {
                                return tbSimpleEditor_input.sendKeys(originalCustomerName).then(function () {
                                    return tbFormSaveBtn.click().then(function () {
                                        return true;
                                    });
                                });
                            });
                        } else {
                            return tbFormCancelBtn.click().then(function () {
                                return true;
                            });
                        }
                    });
                });
            });
        });
    }

    beforeAll(function () {
        browser.get('index.html');
        element(by.id('testsSelector')).click();
        element(by.id('tbFormTest')).click();
    });

    beforeEach(function () {
        browser.executeScript('localStorage.clear()')
    });

    afterAll(function () {
        browser.executeScript('localStorage.clear()')
    });

    describe('tbSimpleEditor', function () {

        beforeAll(function () {
            //* Assign test variables *\\
            // 3rd element in list, should be: <OrderID = 3 , Customer Name = Unosquare LLC ... >
            tbFormEditBtn = element.all(by.repeater('row in $component.rows')).get(2).$$('td').first().$('button');
            // Save and Cancel buttons
            tbFormSaveBtn = $('div.modal-dialog form').$('#btnSave');
            tbFormCancelBtn = $('div.modal-dialog form').$('#btnCancel');
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

            //* Restore default value *\\
            tbSimpleEditorRestore().then(function () {
                tbFormEditBtn.click();
            });

        });

        afterEach(function () {           
            tbSimpleEditorRestore().then(function () {
                tbFormEditBtn.click();
            });
        });

        it('should set initial input value to the value of "value" attribute when defined', function () {
            expect(tbSimpleEditor_input.getAttribute('value')).toMatch(originalCustomerName);
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
            expect(tbSimpleEditor_label.getText()).toMatch('Customer Name')
        });

        it('should set input placeholder to the value of "placeholder" attribute', function () {
            tbSimpleEditor_input.clear().then(function() {
                expect(tbSimpleEditor_input.getAttribute('placeholder')).toMatch('Enter Customer');
            });
        });

        it('should validate the control using the "regex" attribute, if present', function () {
            var errorPresent = false;
            
            tbSimpleEditor_input.clear().then(function() {
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

            tbSimpleEditor_input.clear().then(function() {
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
            tbSimpleEditor_input.clear().then(function() {
                tbSimpleEditor_input.sendKeys('UNOS22').then(function () {
                    tbFormSaveBtn.click().then(function () {
                        tbFormEditBtn.click().then(function () {
                            tbSimpleEditor_input.getAttribute('value').then(function (text) {
                                expect(text).toMatch('UNOS22');
                            });
                        });
                    });
                });
            });
        });

        it('should NOT submit modifications to item/server when clicking form "Cancel"', function () {
            tbSimpleEditor_input.getAttribute('value').then(function(text) {
                expect(text).toMatch(originalCustomerName);
            })
            .then(function() {
                tbSimpleEditor_input.sendKeys('22').then(function() {
                    tbFormCancelBtn.click().then(function() {
                        tbFormEditBtn.click().then(function() {
                            tbSimpleEditor_input.getAttribute('value').then(function(text) {
                                expect(text).toMatch(originalCustomerName);
                            });
                        });
                    });
                });
            });
        });
        
    });

});
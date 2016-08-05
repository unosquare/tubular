
// This protractor scen file tests the tubularHttp.
describe('tbHttp', function () {
    
    beforeEach(function () {
         browser.get('index.html');
        element(by.id('tbLogin')).click();
    });

    it('should be authenticated', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnAuth')).click().then(function(){
            expect($('#isAuth').getText()).toBe('is Authenticated!');
        }); 
    });
    
    it('retrieve data', function () {
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnRetData')).click().then(function () {
            expect($('#lbRet').getText()).toBe('true');
        });
    });
    
    it('should not login bad credentials', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.');
        element(by.id('submitBtn')).click().then(function(){
            expect($('#isAuth').getText()).toBe('false');
        });
    });
   
    it('should expirated', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnExp')).click().then(function(){
            expect($('#expAuth').getText()).toBe('Not Authenticated');
        });         
    });
    
    it('get method-Is not authenticated', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnExp')).click();
        element(by.id('btnGet')).click().then(function(){
            if($('#lbGet').isDisplayed()){
                expect($('#lbGet').getText()).toBe('cancel');
            }
        });        
    });
    
    it('post method-Is not authenticated', function(){
        element(by.model('username')).sendKeys('admin');
        element(by.model('password')).sendKeys('pass.word');
        element(by.id('submitBtn')).click();
        element(by.id('btnExp')).click();
        element(by.id('btnPost')).click().then(function(){
            expect($('#lbPost').getText()).toBe('null');
        });
    });
});

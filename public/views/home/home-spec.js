describe('angularjs homepage todo list', function() {
  xit('should have 4 clickable sliders', function() {
    browser.get('http://localhost:3000');
    browser.waitForAngular();
    element(by.css('sliderContainer')).isPresent();
    var sliders = element.all(by.css('.sliderContainer'));
    expect(sliders.count()).toEqual(4);

    element(by.css('slider')).click();

    // expect(todoList.get(2).getText()).toEqual('write first protractor test');
    //
    // todoList.get(2).element(by.css('input')).click();
    // var completedAmount = element.all(by.css('.done-true'));
    // expect(completedAmount.count()).toEqual(2);
  });
});
// && (webdriver-manager start) && sleep 5 && protractor conf.js
// TODO: put protractor test back into precommit hook - currently breaking unless run separately

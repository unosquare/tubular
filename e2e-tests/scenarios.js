'use strict';

describe('component: tbGrid', function () {
    var component, scope, hero, $componentController;

    beforeEach(module('tubular'));

    beforeEach(inject(function ($rootScope, _$componentController_) {
        scope = $rootScope.$new();
        $componentController = _$componentController_;
        hero = { name: 'Wolverine' };
    }));

    it('should set the default values of the hero', function () {
        // It's necessary to always pass the scope in the locals, so that the controller instance can be bound to it
        component = $componentController('heroDetail', { $scope: scope });

        expect(component.hero).toEqual({
            name: undefined,
            location: 'unknown'
        });
    });

    it('should assign the name bindings to the hero object', function () {
        // Here we are passing actual bindings to the component

        component = $componentController('heroDetail',
          { $scope: scope },
          { hero: hero }
        );
        expect(component.hero.name).toBe('Wolverine');
    });

    it('should call the onDelete binding when a hero is deleted', function () {
        component = $componentController('heroDetail',
          { $scope: scope },
          { hero: hero, onDelete: jasmine.createSpy('deleteSpy') }
        );

        component.onDelete({ hero: component.hero });
        expect(spy('deleteSpy')).toHaveBeenCalledWith(component.hero);
    });

});
angular.module("umbraco").controller("ContentBlocks.Previews.ImageController", function ($scope, entityResource) {
    var vm = this;
    vm.imageUrl = null;
    function loadImage(propertyValue) {
        if (propertyValue != "") {
            entityResource.getById(propertyValue, "Media").then(function (ent) {
                vm.imageUrl = ent.metaData.MediaPath;
            });
        } else {
            vm.imageUrl = null;
        }
    }
    loadImage($scope.block.data.image);
    $scope.$watch("block.data.image", function (newValue, oldValue) {
        if (newValue === oldValue) return;
        loadImage(newValue);
    });

});
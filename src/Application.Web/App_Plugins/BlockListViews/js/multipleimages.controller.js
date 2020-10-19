angular.module("umbraco").controller("ContentBlocks.Previews.MultipleImageController", function ($scope, entityResource) {
    var vm = this;
    vm.imageUrls = [];
    const getUrl = async (url) => {
        var media = await entityResource.getById(url, "Media")
        return media
    }
    const getImages = async (images) => {
        var imageIds = images.split(",");
        return Promise.all(imageIds.map(x => getUrl(x)))
    }
    getImages($scope.block.data.images).then(x =>  vm.imageUrls = x )
    $scope.$watch("block.data.images", function (newValue, oldValue) {
        if (newValue === oldValue) return;
        getImages(newValue).then(x => vm.imageUrls = x);
    });

});
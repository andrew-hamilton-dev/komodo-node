Element.prototype.hasClassName = function (a) {
    return new RegExp("(?:^|\\s+)" + a + "(?:\\s+|$)").test(this.className);
};

Element.prototype.addClassName = function (a) {
    if (!this.hasClassName(a)) {
        this.className = [this.className, a].join(" ");
    }
};

Element.prototype.removeClassName = function (b) {
    if (this.hasClassName(b)) {
        var a = this.className;
        this.className = a.replace(new RegExp("(?:^|\\s+)" + b + "(?:\\s+|$)", "g"), " ");
    }
};

Element.prototype.toggleClassName = function (a) {
  this[this.hasClassName(a) ? "removeClassName" : "addClassName"](a);
};

var komodo = angular.module('komodoApp', ['ngResource']);

komodo.controller('ImageController', function($scope, $window, ImageFactory) {
	var iconSaved = "glyphicon-saved";
    var iconChanged = "glyphicon-save";

    var dataStateMessage = ['Saved', 'Save Changes'];
    $scope.masterImage = "";
    $scope.image = "";
    $scope.dataState = "saved";
    $scope.dataStateMessage = dataStateMessage[0];
    $scope.statusIcon = iconSaved;
    $scope.revertStatus = "hidden";

	$scope.loadImage = function(id) {
		$scope.masterImage = ImageFactory.get({},{'Id': id}, function success() {
            $scope.image = angular.copy($scope.masterImage);
        }, function err() {
            alert("load error");
        });
        
    };

    $scope.updateImage = function(image) {
        if ($scope.dataState != "saved") {
            ImageFactory.update({'Id': image._id}, $scope.image, function success() {
                $scope.image.updated = new Date();
                $scope.masterImage = angular.copy($scope.image);
                setDataState("saved");
            }, function err() {
                alert("update error");
            });
        }
    };

    $scope.revertImage = function(image) {
        $scope.image = angular.copy($scope.masterImage);
        setDataState("saved");
    };

    $scope.deleteImage = function(image) {
        ImageFactory.delete({'Id': $scope.image._id}, function success() {
            $window.location.href = '/images';
        }, function err() {
            alert("delete error");
        });
    };

    $scope.closeImage = function(image) {
        $window.location.href = '/images';
    };

    $scope.onChange = function(image) {
        setDataState("changed");
    };

    function setDataState(status) {
        $scope.dataState = status;
        setStatusIcon();
    }

    function setStatusIcon() {
        switch ($scope.dataState) {
          case "saved":
            $scope.statusIcon = iconSaved;
            $scope.dataStateMessage = dataStateMessage[0];
            $scope.revertStatus = "hidden";
            break;
          case "changed":
            $scope.statusIcon = iconChanged;
            $scope.dataStateMessage = dataStateMessage[1];
            $scope.revertStatus = "";
            break;
        }
    }

});

komodo.controller('ImageListController', function($scope, $window) {

    $scope.setActiveSort = function(sortStr) {
        var qSort = getParameterByName('sort');
        console.log("qSort=" + qSort + "!");

        if (qSort !== "") {
            if (qSort.toLowerCase() === sortStr.toLowerCase()) {
                return "active";
            } else {
                return "";
            }
        } else {
            if (sortStr.toLowerCase() === "date-dsc") {
                return "active";
            }
        }
    };

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),results = regex.exec($window.location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

});

// Image Resource - factory for standard api calls
komodo.factory("ImageFactory", function ($resource) {
    return $resource("/api/images/:Id",{Id: "@Id" },
        {
            "update": {method: "PUT"},
        }
    );
});
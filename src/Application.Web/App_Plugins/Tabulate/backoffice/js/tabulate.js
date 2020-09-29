(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! tabulate - v3.0.2-build49 - 2020-05-12
 * Copyright (c) 2020 Nathan Woulfe;
 * Licensed MIT
 */
    (() => {

        angular.module('tabulate.directives', []);
        angular.module('tabulate.resources', []);
        angular.module('tabulate.services', []);
        angular.module('tabulate.components', []);
        angular.module('tabulate.filters', []);

        angular.module('tabulate', [
            'tabulate.directives',
            'tabulate.services',
            'tabulate.components',
            'tabulate.resources',
            'tabulate.filters'
        ]);

        angular.module('umbraco').requires.push('tabulate');

    })();
(function () {

    function tabulateController($scope, $q, $filter, authResource, assetsService, notificationsService, editorService, tabulateResource, tabulatePagingService) {
        var _this = this;

        var basePath = '../app_plugins/tabulate/backoffice/';
        var dialogPath = $scope.model.config.customView || basePath + 'views/dialog.html';

        // let's add a stylesheet to pretty it up     
        assetsService.loadCss(basePath + 'style.min.css');

        // hide the umbraco label if the view is set to wide
        $scope.model.hideLabel = $scope.model.config.wide;
        var rteConfig = $scope.model.config.rte;

        // these don't need to be scoped
        var data = void 0,
            settings = void 0;

        // this is simply for convenience - update data/settings rather than $scope.model.value.data
        // need to remember though to call it whenever the data or settings objects are modified
        var updateUmbracoModel = function updateUmbracoModel() {
            $scope.model.value.data = data;
            $scope.model.value.settings = settings;
        };

        // helper function to generate a model based on config values
        var emptyModel = function emptyModel() {
            var newModel = {};
            settings.columns.forEach(function (c) {
                newModel[c.displayName] = '';
            });
            newModel._id = data.length;

            return newModel;
        };

        // clear model
        var clearModel = function clearModel() {
            if (confirm('Do you really want to delete all data?')) {
                data = [];
                settings = [];
                _this.pagination = {
                    items: [],
                    currentPage: 1,
                    search: '',
                    pageNumber: 1,
                    pageIndex: 0
                };

                $scope.model.value = undefined;
                init();
            }
        };

        // iterate the model data, assign each object an id
        var setIds = function setIds() {
            data.forEach(function (o, i) {
                o._id = i;
            });
        };

        // get/set the sort order for the model, apply sort filter if necessary
        // if sorting is manual, the order is unchanged
        var setSorting = function setSorting() {
            _this.manualSort = false;

            if (settings.sortOrder === undefined) {
                settings.sortOrder = 'A';
            } else if (settings.sortOrder === 'M') {
                settings.numPerPage = data.length;
                _this.manualSort = true;
            } else {
                data = $filter('orderBy')(data, '_label', settings.sortOrder === 'D' ? true : false);
            }

            updateUmbracoModel();
        };

        // remove a column from settings
        var removeColumn = function removeColumn(col) {
            // if this is the last column, get confirmation first, then remove the column and model data
            // otherwise, remove the column if multiple remain
            if (settings.columns.length === 1 && confirm('Removing all columns will also delete all stored data. Continue?')) {
                settings = {
                    columns: [],
                    label: '',
                    isListView: false,
                    numPerPage: 10
                };
                data = [];
                setPaging();
                _this.noConfig = true;
            } else if (settings.columns.length > 1) {

                var dataLabel = settings.columns[col].displayName;
                data.forEach(function (item) {
                    if (item.hasOwnProperty(dataLabel)) {
                        delete item[dataLabel];
                    }
                });

                settings.columns.splice(col, 1);
            }
            updateUmbracoModel();
        };

        // update column names/types
        var updateColumns = function updateColumns(changes) {
            // each change has a new and old value - only continue if new exists ie has been changed
            // i = counter for the outer loop
            // c = changes object for the loop iteration
            // j = counter for the inner loop
            // d = the data object for the inner loop iteration
            var i = void 0,
                c = void 0,
                j = void 0,
                d = void 0;
            for (i = 0; i < changes.length; i += 1) {
                c = changes[i];
                if (c.newName !== undefined) {
                    // check each value for old name, if it exists update to new
                    for (j = 0; j < data.length; j += 1) {
                        d = data[j];

                        // has a renamed column, needs updating
                        if (d.hasOwnProperty(c.old)) {
                            // add a new property using the old value, then delete the old property
                            // only if the name has changed
                            if (c.newName !== c.old) {
                                d[c.newName] = d[c.old];
                                delete d[c.old];
                            }
                            // update the type, only if it has changed
                            if (d.type !== c.newType) {
                                d.type = c.newType;
                            }
                        }
                    }
                }
            }
        };

        /**
         * Open the overlay to add a new row
         */
        var addRow = function addRow() {

            var addOverlay = {
                view: dialogPath,
                title: 'Add row',
                type: 'add',
                size: 'small',
                data: emptyModel(),
                config: settings,
                rteConfig: rteConfig,
                submit: function submit(model) {

                    editorService.close();

                    setRteFields(model);

                    // geocode the model and add it to the model
                    var newItem = _this.mapsLoaded ? tabulateResource.geocode(model.data) : model.data;
                    newItem = tabulateResource.setLabels(newItem, true, settings.label);

                    data.push(newItem);

                    updateUmbracoModel();

                    setSorting();
                    setIds();
                    setPaging();
                },
                close: function close() {
                    editorService.close();
                }
            };

            editorService.open(addOverlay);
        };

        /**
         * Open the overlay to edit an existing row
         * @param {any} $index
         */
        var editRow = function editRow($index) {
            var editOverlay = {
                view: dialogPath,
                title: 'Edit row',
                type: 'edit',
                size: 'small',
                data: data[$index],
                config: settings,
                rteConfig: rteConfig,
                submit: function submit(model) {
                    editorService.close();

                    setRteFields(model);

                    // if the model has a new address, geocode it
                    // then store the model in the model
                    model.data = tabulateResource.setLabels(model.data, true, settings.label);
                    data[$index] = model.recode === true && _this.mapsLoaded ? tabulateResource.geocode(model.data) : model.data;

                    if (model.remap !== undefined && model.remap.length > 0 && settings.mappings && settings.mappings.length) {
                        tabulateResource.updateMappedEditor(model, undefined, settings.mappings);
                    }

                    updateUmbracoModel();

                    setSorting();
                    setIds();
                    setPaging();
                },
                close: function close() {
                    return editorService.close();
                }
            };

            editorService.open(editOverlay);
        };

        /**
         * Remove an existing row from the collection
         * @param {any} $index
         */
        var removeRow = function removeRow($index) {
            if (data.length && confirm('Are you sure you want to remove this?')) {
                data.splice($index, 1);

                updateUmbracoModel();
                setIds();
                setPaging();
            }
        };

        /**
         * Set the disabled state for the selected row
         * @param {any} $index
         */
        var disableRow = function disableRow($index) {
            var v = data[$index];
            v.disabled = v.disabled === undefined || v.disabled === false ? true : false;

            if (settings.mappings && settings.mappings.length) {
                tabulateResource.updateMappedEditor(undefined, v, settings.mappings);
            }
            updateUmbracoModel();
        };

        /**
         * 
         * 
         * @param {any} model
         */
        var setRteFields = function setRteFields(model) {
            // get the value from rte fields, if any exist
            var rteKeys = Object.keys(model.rteConfig);

            if (rteKeys.length) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = rteKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;

                        model.data[key] = model.rteConfig[key].value;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        };

        /**
         * Open  the settings overlay
         */
        var openSettings = function openSettings() {

            _this.search = '';

            var settingsOverlay = {
                view: basePath + 'views/settings.html',
                title: 'Settings',
                size: 'small',
                data: data,
                config: settings,
                submit: function submit(model) {
                    editorService.close();

                    data = model.data;

                    setSorting();
                    setIds();
                    setPaging();

                    // if the columnsToRemove array exists, remove each config row
                    if (model.columnsToRemove.length > 0) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = model.columnsToRemove[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var column = _step2.value;

                                removeColumn(col);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }

                    // changes object will exist if changes were made to column names
                    if (model.changes && model.changes.length) {
                        updateColumns(model.changes);
                    }

                    // if the config has been altered
                    if (model.changes && model.changes.length || model.newColumnName || model.configChanged) {
                        notificationsService.success('Settings updated', 'Don\'t forget to save your changes');
                    }

                    // better force the labels to be reset - not always apparent from checking config changes
                    data = tabulateResource.setLabels(data, true, settings.label);

                    // finally, if there's nothing left in the config, set the noConfig state
                    _this.noConfig = settings === undefined ? true : false;

                    // need to do this explicitly as it may be imported content
                    updateUmbracoModel();
                },
                close: function close() {
                    editorService.close();
                }
            };

            editorService.open(settingsOverlay);
        };

        /**
         * 
         * @param {any} pageNumber
         */
        var goToPage = function goToPage(pageNumber) {
            _this.pagination.pageIndex = pageNumber - 1;
            _this.pagination.pageNumber = pageNumber;

            setPaging();
        };

        /**
         * get the page from the paging service
         */
        var setPaging = function setPaging() {
            _this.pagination = tabulatePagingService.updatePaging(data, _this.pagination.search, _this.pagination.pageNumber, settings.numPerPage);
            _this.noResults = _this.pagination.items.length === 0 && data.length ? true : false;
        };

        angular.extend(this, {
            // props
            manualSort: false,
            hideSettings: true,
            pagination: {
                items: [],
                totalPages: 1,
                search: '',
                pageNumber: 1,
                pageIndex: 0
            },
            noConfig: true,
            sortOptions: {
                axis: 'y',
                cursor: 'move',
                handle: '.sort-handle',
                stop: function stop() {
                    $scope.model.value.data = data = _this.pagination.items;
                    setIds();
                }
            },

            // functions
            addRow: addRow,
            editRow: editRow,
            removeRow: removeRow,
            disableRow: disableRow,
            clearModel: clearModel,
            openSettings: openSettings,
            setPaging: setPaging,
            goToPage: goToPage
        });

        /////////////////////////////////
        // kick the whole thing off... //
        /////////////////////////////////
        var init = function init() {
            if ($scope.model.value === undefined || $scope.model.value.length === 0) {
                $scope.model.value = {
                    settings: {
                        columns: [],
                        label: '',
                        islistView: false,
                        numPerPage: 10
                    },
                    data: []
                };
                data = $scope.model.value.data;
                settings = $scope.model.value.settings;
            } else if ($scope.model.value.settings !== undefined) {
                data = $scope.model.value.data;
                settings = $scope.model.value.settings;

                _this.noConfig = false;

                if (data) {
                    setSorting();
                    setIds();
                    setPaging();
                }
            }
        };

        var promises = [tabulateResource.loadGoogleMaps($scope.model.config.mapsApiKey), authResource.getCurrentUser()];

        $q.all(promises).then(function (resp) {
            _this.mapsLoaded = resp[0];
            _this.hideSettings = resp[1].userGroups.indexOf('admin') === -1 && $scope.model.config.adminOnly;

            init();
        });
    }

    angular.module('tabulate').controller('Tabulate.Controller', ['$scope', '$q', '$filter', 'authResource', 'assetsService', 'notificationsService', 'editorService', 'tabulateResource', 'tabulatePagingService', tabulateController]);
})();

(function () {

    function tabulateDialogController($scope, editorService) {

        this.inputType = function (type) {
            return type === 'string' ? 'text' : type;
        };

        // view loops through the properties array to build the rte - o will have a value added if the data model contains rte fields
        $scope.model.rteConfig = {};

        var getRteConfig = function getRteConfig(n) {
            return {
                alias: n.toLowerCase(),
                config: {
                    editor: $scope.model.rteConfig,
                    hideLabel: true
                },
                culture: null,
                description: '',
                editor: 'Umbraco.TinyMCE',
                hideLabel: true,
                id: n.length,
                isSensitive: false,
                label: n,
                readonly: false,
                validation: {
                    mandatory: false,
                    pattern: null
                },
                value: $scope.model.data[n],
                view: 'views/propertyeditors/rte/rte.html'
            };
        };

        var rtes = $scope.model.config.columns.filter(function (x) {
            return x.type === 'rte';
        });
        if (rtes) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = rtes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var rte = _step3.value;

                    $scope.model.rteConfig[rte.displayName] = getRteConfig(rte.displayName);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        // specific to edit //
        if ($scope.model.type === 'edit') {

            this.hasGeocodedAddress = $scope.model.data._Address && $scope.model.data._Address.lat !== undefined && $scope.model.data._Address.lng !== undefined;

            // if the passed data includes an address, and the value changes
            // set a flag to recode the address
            $scope.$watch('model.data.Address', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.model.recode = true;
                }
            });
        }

        this.viewLocation = function () {

            var mapOverlay = {
                view: '../App_Plugins/Tabulate/backoffice/views/mapDialog.html',
                lat: $scope.model.data.lat,
                lng: $scope.model.data.lng,
                title: 'Update address coordinates',
                submit: function submit(resp) {
                    editorService.close();

                    var keys = Object.keys($scope.model.data._Address);

                    if (keys.length === 2) {
                        $scope.model.data._Address[keys[0]] = resp.lat;
                        $scope.model.data._Address[keys[1]] = resp.lng;

                        $scope.model.data.lat = resp.lat;
                        $scope.model.data.lng = resp.lng;
                    }
                },
                close: function close() {
                    editorService.close();
                }
            };

            editorService.open(mapOverlay);
        };
    }

    angular.module('tabulate').controller('Tabulate.DialogController', ['$scope', 'editorService', tabulateDialogController]);
})();
(function () {

    function tabulateMapDialogController($scope) {

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: new google.maps.LatLng($scope.model.lat, $scope.model.lng)
        });

        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng($scope.model.lat, $scope.model.lng),
            draggable: true
        });

        var dragend = function dragend(e) {
            if ($scope.model.lat !== e.latLng.lat() || $scope.model.lng !== e.latLng.lng()) {
                $scope.model.lat = e.latLng.lat();
                $scope.model.lng = e.latLng.lng();
            }
        };

        google.maps.event.addListener(marker, 'dragend', function (event) {
            dragend(event);
        });
    }

    angular.module('tabulate').controller('Tabulate.MapDialogController', ['$scope', tabulateMapDialogController]);
})();
(function () {

    function tabulateSettingsController($scope, $filter, tabulateResource, notificationsService) {
        var _this2 = this;

        var l = $scope.model.data !== undefined ? $scope.model.data.length : 0; // model data length
        var importKeys = []; // array of header text from imported csv

        var geocoder = void 0;

        this.types = tabulateResource.fieldTypes();
        this.importDisabled = true;
        this.showing = 'json';

        $scope.model.columnsToRemove = []; // remove an existing column - need to handle data removal
        $scope.model.changes = []; // store a copy of the config object for comparison when the modal is submitted

        if ($scope.model.config.columns !== undefined && $scope.model.config.columns.length) {
            for (var i = 0; i < $scope.model.config.columns.length; i += 1) {

                /* set default sort order if none exists */
                if (i === 0 && $scope.model.config.columns[i].sortOrder === undefined) {
                    $scope.model.config.columns[i].sortOrder = 'A';
                }

                /* push copy into changes object */
                $scope.model.changes.push({
                    old: $scope.model.config.columns[i].displayName
                });
            }

            // set a default label to the display name of the first column
            if ($scope.model.config.label === '') {
                $scope.model.config.label = '{' + $scope.model.config.columns[0].displayName + '}';
            }
        }

        /* by default, disable the import button, if there is data, display in the view */
        if ($scope.model.data) {
            this.importExport = JSON.stringify($scope.model);
        }

        /**
         * when a column is updated, store the new name for comparison when the modal is submitted
         * @param {int} columnIndex => the column being updated
         */
        this.changedColumn = function (columnIndex) {
            $scope.model.changes[columnIndex].newName = $scope.model.config.columns[columnIndex].displayName;
            $scope.model.changes[columnIndex].newType = $scope.model.config.columns[columnIndex].type;
        };

        // todo => how would this be managed with variants?
        /* set values for the mappings - can map to any other tabulate instance on the node */
        //this.tabulateEditors = [];
        //editorState.current.tabs.forEach(v => {
        //    v.properties.forEach(vv => {
        //        if ($scope.model.alias !== vv.alias && vv.editor === 'NW.Tabulate') {
        //            this.tabulateEditors.push(vv);
        //        }
        //    });
        //});

        //this.setTargetEditorColumns = alias => {
        //    if (alias !== undefined) {
        //        this.tabulateEditors.forEach(v => {
        //            if (v.alias === alias) {
        //                this.targetEditorColumns = v.value.settings.columns;
        //            }
        //        });
        //    }
        //};

        /* add object to model */
        //this.addEmptyItem = () => {
        //    if ($scope.model.config.mappings === undefined) {
        //        $scope.model.config.mappings = [];
        //    }

        //    $scope.model.config.mappings.push({});
        //};

        //*  remove object from the model */
        //this.removeMapping = index => {
        //    $scope.model.config.mappings.splice(index, 1);
        //};

        //this.populateItem = (index, mapping) => {
        //    $scope.model.config.mappings[index] = mapping;
        //};


        /**
         * display csv or json in the export textarea
         * @param {string} type => json or csv
         */
        this.show = function (type) {
            _this2.importExport = type === 'csv' ? tabulateResource.JSONtoCSV($scope.model.data, $scope.model.config.columns) : JSON.stringify($scope.model);
            _this2.importDisabled = true;
            _this2.showing = type;
        };

        /**
         * was a column added? add to the collection if so
         */
        this.addColumn = function () {
            $scope.model.config.columns.push({
                displayName: _this2.newColumnName,
                type: _this2.newColumnType
            });

            delete _this2.newColumnName;
            delete _this2.newColumnType;
        };

        /**
         * Removes a column from the config.columns array, data is removed in the controller on submit
         * @param {any} i => the index of the column to remove
         */
        this.removeColumn = function (i) {
            if (confirm('Are you sure you want to remove this column?')) {
                $scope.model.columnsToRemove.push(i); // data is removed on submit
                $scope.model.config.columns.splice(i); // remove it from the current columns list
            }
        };

        /**
         * give two download options - raw json, or parsed csv
         */
        this.download = function () {

            var filename = 'download.' + _this2.showing;
            var d = JSON.parse(JSON.stringify(_this2.importExport)); // we need a copy of the data, not a reference

            if (!navigator.userAgent.match(/msie|trident/i)) {
                var saving = document.createElement('a');

                saving.href = 'data:attachment/' + _this2.showing + ',' + encodeURIComponent(d);
                saving.download = filename;
                saving.click();
            } else {
                var blob = new Blob([d]);
                window.navigator.msSaveOrOpenBlob(blob, filename);
            }
        };

        /**
         * if the importexport value changes, through a direct edit or pasting in a new csv display the import button
         */
        $scope.$watch(function () {
            return _this2.importExport;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal && newVal.length === 0) {
                _this2.importDisabled = false;
            }
        });

        /**
         * helper function to convert CSV to JSON - not part of tabulateResource as it needs to populate the import keys object
         * @param {any} csv => the string to convert
         * @returns {object} => the resulting JSON object
         */
        var convertCsvToJson = function convertCsvToJson(csv) {

            try {
                var array = tabulateResource.CSVtoArray(csv);
                var objArray = [];
                var key = void 0;

                for (var _i = 1; _i < array.length; _i += 1) {
                    objArray[_i - 1] = {};
                    for (var j = 0; j < array[0].length && j < array[_i].length; j += 1) {
                        key = array[0][j];

                        if (importKeys.indexOf(key) === -1) {
                            importKeys.push(key);
                        }
                        objArray[_i - 1][key] = array[_i][j];
                    }
                }

                var json = JSON.stringify(objArray);
                return json.replace(/\},/g, '},\r\n');
            } catch (e) {
                noticationsService.error('Import error', e);
                return '';
            }
        };

        /**
         * use geocoder to convert address to lat lng points
         * @param {any} index => which item is being updated?
         * @param {any} geoStr => alias for encoded
         * @param {any} p => alias for source
         */
        var geocodeAddresses = function geocodeAddresses(index, geoStr, p) {

            var address = $scope.model.data[index];

            geocoder.geocode({ 'address': address[p] }, function (results, status) {
                /* if the geocoding was successful, add the location to the object, otherwise, set location as undefined to ensure key exists */
                if (status === google.maps.GeocoderStatus.OK) {
                    address[geoStr] = results[0].geometry.location;
                } else {
                    address[geoStr] = undefined;
                    notificationsService.error('Error', 'Geocoding failed for address: ' + address[p]);
                }

                /* recurse through the data object */
                if (index + 1 < l) {
                    geocodeAddresses(index + 1, geoStr, p);
                } else {
                    notificationsService.success('Success', 'Geocoding completed successfully');
                }
            });
        };

        /**
         * imports new data from csv
         */
        var importCsv = function importCsv() {

            /* only proceed if user confirms - import will clear the existing model value */
            if (confirm('Importing will overwrite all existing data. Continue?') && _this2.importExport.length) {

                /* parse the csv and push into the data object, provided it is no longer than 250 records */
                var csvToJson = JSON.parse(convertCsvToJson(_this2.importExport));
                if (csvToJson.length > 0 && csvToJson.length < 2510) {

                    $scope.model.data = csvToJson;

                    /* prompt for geocoding */
                    /* geocodeAddresses method recurses through the data model */
                    if (importKeys.indexOf('Address') !== -1) {

                        /* accepts seed index, alias for encoded address, alias for source property */
                        if (window.google.maps !== undefined) {
                            geocoder = new google.maps.Geocoder();
                            geocodeAddresses(0, '_Address', 'Address');
                        } else {
                            notificationsService.error('Error', 'Google maps API not available - geocoding failed');
                        }
                    }

                    /* clear the config array and update with the new keys from the csv */
                    $scope.model.config.columns = [];
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = importKeys[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var key = _step4.value;

                            $scope.model.config.columns.push({
                                displayName: key,
                                type: 'string'
                            });
                        }

                        /* disable importing, set a flag for config changes and new data */
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }

                    _this2.importExportDisabled = true;
                    $scope.model.configChanged = true;
                } else {
                    notificationsService.error('Error', 'Import failed - dataset must be between 1 and 250 records');
                }
            }
        };

        /**
         * Import the pasted data into the current model
         */
        this.import = function () {
            if (_this2.importExport[0] === '{') {
                try {
                    $scope.model = JSON.parse(_this2.importExport);
                } catch (e) {
                    alert('Invalid JSON input');
                }
            } else {
                importCsv();
            }
        };

        /**
         *
         */
        this.sort = function () {
            if ($scope.model.data && $scope.model.config.sortOrder !== 'M') {
                $scope.model.data = $filter('orderBy')($scope.model.data, '_label', $scope.model.config.sortOrder === 'D' ? true : false);
            }
            $scope.model.configChanged = true;
        };
    }

    angular.module('tabulate').controller('Tabulate.SettingsController', ['$scope', '$filter', 'tabulateResource', 'notificationsService', tabulateSettingsController]);
})();

(function () {
    function tabulateResource(notificationsService, assetsService, $q, editorState) {
        var _this3 = this;

        return {

            fieldTypes: function fieldTypes() {
                return [{ label: 'Text string', value: 'string' }, { label: 'Textarea', value: 'textarea' }, { label: 'Rich text', value: 'rte' }, { label: 'Number', value: 'number' }, { label: 'Email', value: 'email' }, { label: 'Telephone', value: 'tel' }, { label: 'Date', value: 'date' }, { label: 'Url', value: 'url' }, { label: 'Color', value: 'color' }];
            },

            // another helper - goes the opposite way, converting JSON back to CSV for exporting
            JSONtoCSV: function JSONtoCSV(json, header) {

                var arr = (typeof json === 'undefined' ? 'undefined' : _typeof(json)) !== 'object' ? JSON.parse(json) : json;
                var headerKeys = [];

                var csv = '',
                    row = void 0,
                    i = void 0,
                    j = void 0,
                    o = void 0;

                //This condition will generate the Label/Header
                if (header) {
                    row = '';

                    // iterate config as header, taking unique display names
                    for (i = 0; i < header.length; i += 1) {
                        var name = header[i].displayName;
                        if (headerKeys.indexOf(name) === -1) {
                            headerKeys.push(name);
                            row += name + ',';
                        }
                    }
                    // trim trailing comma
                    row = row.slice(0, -1);
                    //append Label row with line break
                    csv += row + '\r\n';
                }

                //1st loop is to extract each row
                for (i = 0; i < arr.length; i += 1) {
                    row = '';
                    o = arr[i];

                    for (j = 0; j < headerKeys.length; j += 1) {
                        var headerKey = o[headerKeys[j]];
                        if (headerKey !== undefined) {
                            var data = typeof headerKey === 'string' ? headerKey : JSON.stringify(headerKey);
                            row += '"' + data.replace(/"/gi, '""') + '",';
                        } else {
                            row += '"",';
                        }
                    }

                    // trim trailling comma
                    row = row.slice(0, -1);
                    //add a line break after each row
                    csv += row + '\r\n';
                }
                return csv;
            },

            // helper function to convert CSV string into an array
            CSVtoArray: function CSVtoArray(strData, strDelimiter) {

                strDelimiter = strDelimiter || ',';

                var objPattern = new RegExp('(\\' + strDelimiter + '|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\' + strDelimiter + '\\r\\n]*))', 'gi');
                var arrData = [[]];

                var arrMatches = void 0,
                    strMatchedDelimiter = void 0,
                    strMatchedValue = void 0;

                while (arrMatches = objPattern.exec(strData)) {
                    strMatchedDelimiter = arrMatches[1];
                    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                        // Since we have reached a new row of data,
                        // add an empty row to our data array.
                        arrData.push([]);
                    }
                    if (arrMatches[2]) {
                        strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
                    } else {
                        strMatchedValue = arrMatches[3];
                    }
                    arrData[arrData.length - 1].push(strMatchedValue);
                }

                return arrData;
            },

            loadGoogleMaps: function loadGoogleMaps(apiKey) {

                var deferred = $q.defer();

                if (!apiKey) {
                    return deferred.resolve(false);
                }

                var loadMapsApi = function loadMapsApi() {
                    if (!window.google.maps) {
                        window.google.load('maps', '3', {
                            other_params: 'key=' + apiKey,
                            callback: function callback() {
                                deferred.resolve(true);
                            }
                        });
                    } else if (window.google.maps) {
                        deferred.resolve(true);
                    }
                };

                if (!window.google) {
                    assetsService.loadJs('//www.google.com/jsapi').then(function () {
                        loadMapsApi();
                    });
                } else {
                    loadMapsApi();
                }

                return deferred.promise;
            },

            // geocodes a single address string
            geocode: function geocode(d) {

                if (window.google.maps !== undefined) {

                    var keys = Object.keys(d);
                    var p = keys.indexOf('Address') !== -1 ? 'Address' : '';

                    if (p !== '' && confirm('Found location data - geocode it?')) {

                        var geoStr = '_' + p;
                        var geocoder = new google.maps.Geocoder();
                        var address = d[p];

                        geocoder.geocode({ 'address': address }, function (results, status) {

                            if (status === google.maps.GeocoderStatus.OK) {
                                d[geoStr] = results[0].geometry.location;
                                d.lat = results[0].geometry.location.lat();
                                d.lng = results[0].geometry.location.lng();
                                notificationsService.success('Success', 'Geocode successful');
                            } else {
                                d[geoStr] = undefined;
                                notificationsService.error('Error', 'Geocode failed: ' + status);
                            }
                        });
                    }
                }

                return d;
            },

            setLabels: function setLabels(items, force, format) {

                if (items) {
                    if (Array.isArray(items)) {
                        items.forEach(function (item) {
                            parseLabel(item);
                        });
                    } else {
                        parseLabel(items);
                    }
                }

                return items;

                // construct the label for the item/s, based on the pattern defined in settings
                // labels can refer to object properties - defined by parent|child in the label
                function parseLabel(o) {
                    if (force || o._label === undefined) {
                        var pattern = /{(.*?)}/g;

                        var m = void 0;
                        var label = '';

                        do {
                            m = pattern.exec(format);

                            if (m) {

                                var labelKeys = m[1].split('|');
                                var replacementText = labelKeys.length === 1 ? o[labelKeys[0]] : o[labelKeys[0]][labelKeys[1]];

                                label = label.length ? label.replace(m[0], replacementText) : format.replace(m[0], replacementText);
                            }
                        } while (m);

                        o._label = label;
                    }
                }
            },

            // modifies a mapped tabulate editor - either update content or toggle enabled/disabled state
            updateMappedEditor: function updateMappedEditor(resp, v, mappings) {

                var setLabels = _this3.setLabels,
                    getMappingScope = _this3.getMappingScope;

                mappings.forEach(function (m) {

                    var mappingElement = getMappingScope(m.targetEditor.alias),
                        i = 0;

                    if (mappingElement) {

                        var key = m.sourceProperty.displayName;
                        var mappingKey = m.targetProperty.displayName;

                        // loop handles editor or state - based on presence of resp or v
                        mappingElement.value.data.forEach(function (mapping) {
                            if (resp !== undefined && resp.remap === mapping[mappingKey]) {
                                mapping[mappingKey] = resp.data[key];
                                setLabels(mapping, true, mappingElement.value.settings.label);
                                i++;
                            } else if (v !== undefined && v[key] === mapping[mappingKey]) {
                                mapping.disabled = v.disabled;
                                i++;
                            }
                        });

                        if (i > 0) {
                            var str = resp === undefined ? v.disabled ? 'deactivated' : 'activated' : 'updated';
                            notificationsService.warning(i + ' row' + (i > 1 ? 's' : '') + ' in ' + m.targetEditor.label + (i > 1 ? ' have' : ' has') + ' been ' + str);
                        }
                    }
                });
            },

            // finding mapping element scope using the existing scope
            // need this for updating other editors when relationships are defined
            getMappingScope: function getMappingScope(alias) {
                var found = false,
                    resp;

                editorState.current.tabs.forEach(function (v) {
                    if (!found) {
                        v.properties.forEach(function (vv) {
                            if (vv.alias === alias) {
                                resp = vv;
                                found = true;
                            }
                        });
                    }
                });

                return resp;
            }
        };
    }

    angular.module('tabulate.resources').factory('tabulateResource', ['notificationsService', 'assetsService', '$q', 'editorState', tabulateResource]);
})();
(function () {

    function tabulatePagingService() {

        /**
         * 
         * @param {any} total
         * @param {any} perPage
         */
        var countPages = function countPages(total, perPage) {
            return Math.ceil(parseInt(total, 10) / parseInt(perPage, 10));
        };

        /**
         * 
         * @param {any} items
         * @param {any} filter
         * @param {any} pageNumber
         * @param {any} numPerPage
         */
        var updatePaging = function updatePaging(items, filter, pageNumber, numPerPage) {

            var begin = (pageNumber - 1) * numPerPage,
                end = begin + numPerPage,
                paged = items;

            // if a filter value exists, filter the items before paging
            if (filter !== undefined) {
                paged = getFilteredPage(items, filter);
            }

            var totalPages = Math.ceil(paged.length / numPerPage);

            if (pageNumber > totalPages) {
                begin = 0;
                end = begin + totalPages;
                pageNumber = 1;
            }

            return { items: paged.slice(begin, end), totalPages: totalPages, pageNumber: pageNumber, search: filter };
        };

        /**
         * 
         * @param {any} items
         * @param {any} term
         */
        var getFilteredPage = function getFilteredPage(items, term) {

            var paged = [];
            var l = items.length;

            var i = void 0,
                // loop index
            j = void 0,
                // inner loop index
            o = void 0,
                // the object plucked from items array
            keys = void 0,
                pushed = void 0;

            for (i = 0; i < l; i += 1) {
                o = items[i];
                pushed = false;

                if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object') {
                    keys = Object.keys(o);
                    for (j = 0; j < keys.length; j++) {
                        if (!pushed && o[keys[j]] !== undefined && o[keys[j]] !== null && o[keys[j]].toString().toLowerCase().indexOf(term.toString().toLowerCase()) !== -1) {
                            paged.push(o);
                            pushed = true;
                        }
                    }
                } else {
                    if (o && o.toLowerCase().indexOf(term.toLowerCase()) !== -1) {
                        paged.push(o);
                    }
                }
            }
            return paged;
        };

        /**
         * 
         * @param {any} i
         * @param {any} j
         */
        var setCurrentPage = function setCurrentPage(i, j) {
            return j === undefined ? i - 1 > 0 ? i - 1 : i : i + 1 <= j ? i + 1 : i;
        };

        return {
            countPages: countPages,
            updatePaging: updatePaging,
            getFilteredPage: getFilteredPage,
            setCurrentPage: setCurrentPage
        };
    }

    angular.module('tabulate.services').factory('tabulatePagingService', tabulatePagingService);
})();

},{}]},{},[1]);

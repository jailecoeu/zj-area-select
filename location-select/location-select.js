/**
 * Created by zhangjj on 2016/1/5.
 */
(function(){
    var tool ,
        handlerbar  = {
            locationCell    : Handlebars.compile( '{{#each this}}\
                <li class="" data-id="{{id}}">\
                <input type="checkbox" {{setCheckStatus isCheck}}>\
                <span>{{name}}</span>\
                </li>\
                {{/each}}' ) ,
            chooseCell      : Handlebars.compile( '{{#each this}}\
                <span data-id="{{id}}">\
                {{name}}\
                <i class="remove">X</i>\
                </span>\
                {{/each}}' )
        } ,
        dom ,
        locationDataList;
    tool   = {
        getLocationData     : function( cb ){
            $.getJSON( "location.json" , function( rtn ){
                locationDataList    = [ { id : 0 , name : "全国" , sub : rtn.data } ];
                cb();
            } );
            return this;
        } ,
        getLocationDataFromId   : function( id , list ){
            var _info;
            list    = list || locationDataList;
            for( var i = list.length; i--; ){
                if( list[ i ].id    == id ){
                    return list[ i ];
                } else if( list[ i ].sub ){
                    _info   = tool.getLocationDataFromId( id , list[ i ].sub );
                    if( _info ){
                        return _info;
                    }
                }
            }
            return false;
        } ,
        displayCountryList      : function( country ){
            country     = country || locationDataList;
            dom.countryContainer.html( handlerbar.locationCell( country ) );
            return this;
        } ,
        displayProvinceList     : function( provinces ){
            provinces   = locationDataList[ 0 ].sub;
            dom.provinceContainer.html( handlerbar.locationCell( provinces ) );
            return this;
        } ,
        displayCityList     : function( cities ){
            dom.cityContainer.html( handlerbar.locationCell( cities ) );
            return this;
        } ,
        selectLocation    : function( id , isCancel ){
            var _info       = typeof id === "object" ? id : this.getLocationDataFromId( id ) ,
                _parentInfo ,
                _checkAll   = true ,
                _ids;
            _info.isCheck   = isCancel ? false : true;
            if( isCancel ){
                _ids        = _info.path.split( "-" );
                for( var i = _ids.length; i--; ){
                    tool.getLocationDataFromId( _ids[ i ] ).isCheck = false;
                }
            } 
            this.checkSelectAll( _info.parentId );
            if( _info.sub ){
                for( var i = _info.sub.length; i--; ){
                    tool.selectLocation( _info.sub[ i ] , isCancel );    
                }
            }
            return _info;
        } ,
        checkSelectAll   : function( id ){
            var _info       = this.getLocationDataFromId( id ) ,
                _checkAll   = true;
            for( var i = _info.sub.length; i--; ){
                if( !_info.sub[ i ].isCheck ){
                    _checkAll   = false;
                    break;
                }
            }
            if( _checkAll ){
                _info.isCheck   = true;
            }
            return this;
        } ,
        getLocationSelectList   : function( list , preList ){
            preList     = preList || [];
            for( var i = 0 , len = list.length; i < len; i++ ){
                if( list[ i ].isCheck ){
                    preList.push( list[ i ] );
                }
                if( !list[ i ].isCheck && typeof list[ i ].sub === "object" ){
                    this.getLocationSelectList( list[ i ].sub , preList );
                }
            }
            return preList;
        } ,
        getLocationSelectListId   :  function(){
            var _ids = [];
            $.each( dom.chooseContainer.children(), function(){
                _ids.push(parseInt($(this).data('id')));
            })
            return _ids;
        },
        displayChooseList   : function(){
            var _list   = this.getLocationSelectList( locationDataList );
            dom.chooseContainer.html( handlerbar.chooseCell( _list ) );
            return this;
        } ,
        bindEvent   : function(){
            dom.countryContainer.on( "click" , "input" , function(){
                var _info   = tool.selectLocation( $( this ).parents( "li" ).data( "id" ) , !this.checked );
                tool.displayCountryList()
                    .displayProvinceList()
                    .displayCityList( _info.sub[ 0 ].sub )
                    .displayChooseList();
            } );
            dom.provinceContainer.on( "click" , "li" , function(){
                tool.displayCityList( tool.getLocationDataFromId( this.dataset.id ).sub )
                    .displayChooseList();
            } );
            dom.provinceContainer.on( "click" , "input" , function(){
                var _info   = tool.selectLocation( $( this ).parents( "li" ).data( "id" ) , !this.checked );
                tool.displayCountryList()
                    .displayProvinceList()
                    .displayCityList( _info.sub )
                    .displayChooseList();
            } );
            dom.cityContainer.on( "click" , "input" , function(){
                var _info   = tool.selectLocation( $( this ).parents( "li" ).data( "id" ) , !this.checked );
                tool.displayCountryList()
                    .checkSelectAll( _info.parentId )
                    .displayProvinceList()
                    .displayChooseList();
            } );
            dom.chooseContainer.on( "click" , "i.remove" , function(){
                var _$span  = $( this ).parents( "span" ) ,
                    _info   = tool.getLocationDataFromId( _$span.data( "id" ) );
                tool.selectLocation( _$span.data( "id" ) , true );
                dom.areaContainer.find('li[data-id="' + _$span.data( "id" ) + '"] input[type=checkbox]')
                                 .prop('checked',false)
                //tool
                //    .displayCountryList()
                //    .displayProvinceList()
                //    .displayCityList( tool.getLocationDataFromId(_info.parentId ).sub );
                _$span.remove();
            } );
            return this;
        } ,
        initHandlerHelper   : function(){
            Handlebars.registerHelper( "setCheckStatus" , function(){
                return this.isCheck ? "checked" : "";
            } );
            return this;
        } ,
        dataSerializate     : function( list , profix , parentId ){
            for( var i = list.length; i--; ){
                list[ i ].path      = ( profix ? ( profix + "-" ) : "" ) + list[ i ].id;   
                list[ i ].parentId  = parentId;
                if( list[ i ].sub ){
                    tool.dataSerializate( list[ i ].sub , list[ i ].path , list[ i ].id );
                }
            }
            return this;
        } ,
        initLocationSelect    : function( ids ){
            //dom.areaContainer.find('input[type=checkbox]').prop('checked',false)
            $.each( ids, function( i, val ){
                //dom.areaContainer.find('li[data-id="' + val + '"] input[type=checkbox]').prop('checked',true)
                tool.selectLocation( val );
            })
            tool.displayCountryList( locationDataList )
                .displayProvinceList( locationDataList[ 0 ].sub )
                .displayCityList( locationDataList[ 0 ].sub[ 0 ].sub )
                .displayChooseList();
            return this;
        } ,
        init    : function(){
            this.initHandlerHelper()
                .dataSerializate( locationDataList , "" , 0 )
                .bindEvent()
                .displayCountryList( locationDataList )
                .displayProvinceList( locationDataList[ 0 ].sub )
                .displayCityList( locationDataList[ 0 ].sub[ 0 ].sub );
            //console.log( locationDataList );
        }

    };

    $.fn.LocationSelect = function(){
        var _html = '<div class="select-area-wrap">\
            <div class="select-area">\
                <div class="province area-container " >\
                    <ul id="country-container"></ul>\
                </div>\
                <div class="city area-container" >\
                    <ul id="province-container"></ul>\
                </div>\
                <div class="city area-container" >\
                    <ul id="city-container"></ul>\
                </div>\
            </div>\
            <p class="">所选区域</p>\
            <div class="all-choose-area" id="choose-container"></div></div>';
        this.html(_html);
        dom         = {
            areaContainer           : $( "#area-container") ,
            countryContainer        : $( "#country-container" ) ,
            provinceContainer       : $( "#province-container" ) ,
            cityContainer           : $( "#city-container" ) ,
            chooseContainer         : $( "#choose-container" )
        }

        tool.getLocationData( function(){ tool.init(); } );
    }

    window.getLocationSelectList    = function(){
        return tool.getLocationSelectList( locationDataList );
    };

    window.getLocationDataFromId   = function( id ){
        return tool.getLocationDataFromId( id );
    };

    window.getLocationSelectListId   = function(){
        return tool.getLocationSelectListId() ;
    };
    window.initLocationSelect   = function(ids){
        return tool.initLocationSelect( ids );
    }
})(jQuery);
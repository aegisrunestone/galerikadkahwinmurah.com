/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
firstBy=function(){function n(n,t){if("function"!=typeof n){var r=n;n=function(n,t){return n[r]<t[r]?-1:n[r]>t[r]?1:0}}return-1===t?function(t,r){return-n(t,r)}:n}function t(t,u){return t=n(t,u),t.thenBy=r,t}function r(r,u){var f=this;return r=n(r,u),t(function(n,t){return f(n,t)||r(n,t)})}return t}();

	var quantities = [50, 100, 250, 500, 750, 1000, 1250, 1500, 2000];
	var current_query = 0;
	var sorted = [];
	var last_load_index = 0;
	var $iso;
	var maxload = 20;
	var is_loading_more = false;
	
	/* From http://stackoverflow.com/questions/3898130/how-to-check-if-a-user-has-scrolled-to-the-bottom#answer-15382570 */
	var _throttleTimer = null;
	var _throttleDelay = 100;
	var $window = $(window);
	var $document = $(document);
	
	/* From http://stackoverflow.com/questions/8584902/get-closest-number-out-of-array */
	function closest(arr, target) {
    if (!(arr) || arr.length == 0)
        return null;
    if (arr.length == 1)
        return i[0];

    for (var i=1; i<arr.length; i++) {
        // As soon as a number bigger than target is found, return the previous or current
        // number depending on which has smaller difference to the target.
        if (arr[i] > target) {
            var p = arr[i-1];
            var c = arr[i]
            return Math.abs( p-target ) < Math.abs( c-target ) ? p : c;
        }
    }
    // No number in array is bigger so return the last.
    return arr[arr.length-1];
	}
	
	function sort(quantity_idx) {
		sorted = $.map(card_data, function(v){return v;});
		sorted.sort(
			firstBy(function(a,b){return a.min_price - b.min_price;})
			.thenBy('uuid')
		);
	}
	
	function load_cards() {
	var to_load = [];
	
	is_loading_more = true;
	sort(current_query);
	
	$.each(sorted, function(idx,i){
		to_load.push(tmpl('article_template',{data:i, req_quantity: current_query}));
		if (idx == maxload) { last_load_index = idx; return false; }
	});
	
	if (typeof $iso != 'undefined') {
		$iso.isotope('remove',$('.grid-item'));
		$it = $(to_load.join(''));
		$('.grid').append($it);
		$iso.isotope('appended', $it).isotope('layout');
		
	}
	else {
		$it = $(to_load.join(''));
		$iso = $('.grid').append($it).isotope({
		percentPosition: true,
		itemSelector: '.grid-item',
		isResizeBound: true
		});
	}
	if (last_load_index+1 >= sorted.length) {
		$('#load_more_button').text('No more results');
	} else {
		$('#load_more_button').on('click',load_more_cards).text('Load more');
	}
	is_loading_more = false;
	}
	
	function load_more_cards() {
		if ((typeof $iso == "undefined") || (last_load_index >= sorted.length)) return false;
		is_loading_more = true;
		
		$('#load_more_button').off('click').text('Loading...');
		var to_load = [];
		var last_idx = last_load_index+maxload;
		
		$.each(sorted.slice(last_load_index+1,last_idx) , function(idx,i){
			to_load.push(tmpl('article_template',{data:i, req_quantity: current_query}));
			last_load_index++;
		});
		$it = $(to_load.join(''));
		$('.grid').append($it);
		$iso.isotope('appended', $it).isotope('layout')
		is_loading_more = false;
		if (last_load_index+1 >= sorted.length) {
			$('#load_more_button').text('No more results');
		} else {
			$('#load_more_button').on('click',load_more_cards).text('Load more');
		}
		
		
	}
	
	function ScrollHandler(e) {
    //throttle event:
    clearTimeout(_throttleTimer);
    _throttleTimer = setTimeout(function () {
        console.log('scroll');

        //do work
        if ($window.scrollTop() + $window.height() > $document.height() - 200) {
            //console.log("near bottom!");
			setTimeout(load_more_cards,500);
        }

    }, _throttleDelay);
	}
	
	
      $(document).ready(function () {
		
		$window.off('scroll', ScrollHandler).on('scroll', ScrollHandler);
		/*
		$('.grid').on('click', '.grid-item-text .price-container', function(){
			var $t = $(this);
			$t.siblings('.price-table-container').slideToggle(0,function(){
				$('.grid').isotope('layout');
			});
			ga('send', 'event', 'Toggle price table', 'click', $t.parents('.grid-item').attr('id')+' : '+$t.children('.product-price').text()+' : '+$t.children('.product-min-order').text(), 1);
		});*/
		
		$('.grid').on('click', '.sold-by-whom .sold-by-link', function(){
			ga('send', 'event', 'Out link', 'click', $(this).attr('href')+' (front)', 1);
		});
		
		$('.grid').on('click','.grid-image-and-overlay-container', function(){
			var url = $(this).parents('.grid-item').data('href');
			History.pushState({},'product_page',url);
			
		});
		/*
		$('#quantity_amount').on('change', function(){
			//$('.grid-item').remove();
			
			current_query = quantities.indexOf(parseInt($(this).val()));
			load_cards();
			
			ga('send', 'event', 'Select quantity', 'select', $(this).val()+' : '+$(this).children('option:selected').text(), 1);
		});
		*/
		$.getJSON('/javascripts/consolidated.json', function(d){
			quad = d;
			card_data =  $.map(quad, function(b){return $.map(b, function(c){return $.map(c.cards, function(d){d.parent = c; return d})})});
			load_cards();
		});
		/*
		$.getJSON('javascripts/quad.json', function(d){
			quad = d;
			load_cards();
			
			//$('.grid').append($it).isotope('appended',$it);
		})*/
		
		$('.popup').on('click',function(e){
			if (e.target == this) popup(false);
		})
		
		
		$('#load_more_button').on('click', load_more_cards)
      })
	  
	  function popup(bool) {
		if (bool) {
			$('.popup').addClass('show');
			$('body').addClass('no-scroll');
		} else {	
			$('.popup').removeClass('show');
			$('body').removeClass('no-scroll');
			History.back();
		}
	  }
	  
	  function fill_popup(d) {
		//var tablehtml = $('#'+d.uuid+' .price-table-container .price-table').html();
		var $tbody = $('#popup_pricing_table tbody');
		$tbody.empty();
		for (var i = 0; i < d.price.length; i++) {
			$tbody.append('<tr><td>'+d.quantity[i]+'</td><td>RM '+d.price[i].toFixed(2)+'</td><td>RM '+d.price[i]*d.quantity[i]+'</td></tr>')
		}
		
		$('#popup_specs_body')
		
	  }
	  
	  History.Adapter.bind(window, 'statechange', function() {
		var State = History.getState();
		
		// returns { data: { params: params }, title: "Search": url: "?search" }
		if (State.title == "product_page") {
			popup(true);
			//fill_popup(quad[$(this).parents('.grid-item').attr('id')]);
			$.get(State.url,function(d){
				var html = $(d).find('#main_content_ajax').html();
				$('.popup-content').html(html);
			})
		}

		// or you could recall search() because that's where this state was saved
		if (State.url == "?search") {
		search(data.params);
		}
		});
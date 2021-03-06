import $ from 'jquery';

class Search {
    // 1. Describe and create/initiate our object
    constructor() {
        this.addSearchHtml();
        this.resultsDiv = $('#search-overlay__results');
        this.openButton = $('.js-search-trigger');
        this.closeButton = $('.search-overlay__close');
        this.searchOverlay = $('.search-overlay');
        this.searchField = $('#search-term');
        this.events();
        this.isOverlayOpen = false;
        this.isSpinnerVisible = false;
        this.previousValue;
        this.typingTimer;
    }

    // 2. Handle events
    events() {
        this.openButton.on('click', this.openOverlay.bind(this));
        this.closeButton.on('click', this.closeOverlay.bind(this));
        $(document).on('keydown', this.keyPressDispatcher.bind(this));
        this.searchField.on('keyup', this.typingLogic.bind(this));
    }

    // 3. Methods

    typingLogic() {
        if (this.searchField.val() != this.previousValue) {
            clearTimeout(this.typingTimer);
            
            if (this.searchField.val()) {
                if (!this.isSpinnerVisible) {
                    this.resultsDiv.html('<div class="spinner-loader"></div>')
                    this.isSpinnerVisible = true;
                }
                this.typingTimer = setTimeout(this.getResults.bind(this), 750);
            } else {
                this.resultsDiv.html('');
                this.isSpinnerVisible = false;
            }
        }

        this.previousValue = this.searchField.val();
    }

    getResults() {
        var query = this.searchField.val();            

        $.when(
            $.getJSON(`${code_university_data.root_url}/wp-json/wp/v2/posts?search=${query}`),
            $.getJSON(`${code_university_data.root_url}/wp-json/wp/v2/pages?search=${query}`)
            ).then((posts, pages) => {
            var combinedResults = posts[0].concat(pages[0]);
            this.resultsDiv.html(`
                <h2 class="search-overlay__section-title">Results for '${this.searchField.val()}'</h2>
                ${combinedResults.length ? '<ul class="link-list min-list">' : '<p>No results found</p>'}
                    ${combinedResults.map(post => `<li><a href="${combinedResults.link}">${post.title.rendered}</a> ${post.type == 'post' ? `by ${post.author_name}` : '' }</li>`).join('')}
                ${combinedResults.length ? '</ul>' : ''}
            `);
        this.isSpinnerVisible = false;
        }, () => {
            this.resultsDiv.html('<p>Unexpected error. Please try again.</p>')
        });
    };

    keyPressDispatcher(e) {
        if (e.keyCode === 83 && !this.isOverlayOpen && !$('input, textarea').is(':focus')) {
            this.openOverlay();
        }
        if (e.keyCode === 27 && this.isOverlayOpen) {
            this.closeOverlay();
        }
    }

    openOverlay() {
        this.searchOverlay.addClass('search-overlay--active');
        $('body').addClass('body-no-scroll');
        this.resultsDiv.html('');
        this.searchField.val('');
        setTimeout(() => this.searchField.focus(), 350);
        console.log('open')
        this.isOverlayOpen = true; 
    }

    closeOverlay() {
        this.searchOverlay.removeClass('search-overlay--active');
        $('body').removeClass('body-no-scroll');
        console.log('close');
        this.isOverlayOpen = false;
    }

    addSearchHtml() {
        $('body').append(`
            <div class="search-overlay">
                <div class="search-overlay__top">
                    <div class="container">
                        <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
                        <input type="text" id="search-term" class="search-term" placeholder="What are you looking for?">
                        <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="container">
                    <div id="search-overlay__results">
                    </div>
                </div>
            </div>
        `);
    }
    
}

export default Search;
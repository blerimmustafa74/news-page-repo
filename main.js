let defaults = {
    per_page: 10,
    page: 1,
    filters: [
        { 
            id: 206, 
            title: "Albania" 
        },
        { 
            id: 211, 
            title: "Bulgaria" 
        },
        { 
            id: 191, 
            title: "Croatia" 
        }
    ]
}

const postsContainer = document.getElementById('posts');
const singlePostContainer = document.getElementById('single-post')
const btn = document.querySelector('.btn__loadmore');
const loader = document.getElementById('loader');
const singlePostID = window?.location?.search?.split('?postId=')?.join('');
const filter = document.getElementById('filter')


const showLoader = function(){
    loader.classList.add('active');
    btn.style.visibility = 'hidden';
}
const hideElements = function(){
    loader.classList.remove('active');
    btn.style.visibility = 'visible';
}


//RENDER ARTICLES

const renderFilters = () => {
    defaults.filters.forEach(({ id, title }) => {
  
      filter.innerHTML += `
      <li>
        <a class="filter__link " href="#" categoryId="${id}" title="${title}">${title}</a>
      </li>`;
        
    });
  
    filter.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        a.classList.add('filter--active');
        const countryID = a.getAttribute("categoryId");
        postsContainer.innerHTML = "";
  
        countryNews(countryID, defaults.per_page, 1);
  
      });

    });
};


const render = (data, type) => {
    const date = data.date.split("T");
    const multipleOrSingleNews = type === 'excerpt' ? data.excerpt : data.content

    const html = `
            <article class="post__content">
                <h2 class="post__title">${data && data.title && data.title.rendered ? data.title.rendered : 'No title for this post'}</h2>
                <a href="/single.html?postId=${data.id}">
                <img src="${data && 
                    data._embedded && 
                    data._embedded['wp:featuredmedia'][0] && 
                    data._embedded['wp:featuredmedia'][0].link ? 
                    data._embedded['wp:featuredmedia'][0].link : 'No image for this post'}" alt="" class="post__image">
                </a>
                <p class="post__date">${date[0]}</p>
                <div class="post__description">${multipleOrSingleNews.rendered}</div>
            </article>
            `
       const renderElement =  singlePostID ? singlePostContainer : postsContainer;
       renderElement.insertAdjacentHTML('beforeend', html);
}

const getSingleNews = async function(singlePostID) {
    // showLoader();
    try {
        const res = await fetch(`https://balkaninsight.com/wp-json/wp/v2/posts/${singlePostID}?_embed=1`)
        const data = await res.json();
        if(data.length > 0) {
            hideElements()
        }
        render(data, 'content');
    } catch (error) {
        console.error(error.message)
    }
}

const countryNews = async function (countryID, per_page = defaults.per_page, page = defaults.page) {
    showLoader();
    try {
        const res = await fetch(`https://balkaninsight.com/wp-json/wp/v2/posts?per_page=${per_page}&page=${page}&_embed=1&categories=${countryID}`);
        const data = await res.json();
        if(data.length > 0){
            hideElements();
        }
        for (const element of data) {

            render(element, 'excerpt');
        }
    } catch (error) {
        console.error(error)
    }
}

if(singlePostID) {

 getSingleNews(singlePostID);
}
else{
    renderFilters();
    countryNews(defaults.filters[0].id, defaults.per_page, defaults.page);
    btn.addEventListener('click', function(){
        defaults.page++
        countryNews(defaults.filters[0].id, defaults.per_page, defaults.page);
    });
}



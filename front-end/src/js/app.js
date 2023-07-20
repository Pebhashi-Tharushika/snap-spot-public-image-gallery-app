const overlay = $("#overlay");
const btnUpload = $("#btn-upload");
const dropZoneElm = $("#drop-zone");
const mainElm = $("main");
const REST_API_URL = `http://localhost:8080/gallery`;
const cssLoaderHtml = `<div class="lds-rectangle"><div></div><div></div><div></div></div>`;
const actionAndImageOverlayHtml = `<div class="action">
                                        <span class="download" title="Download">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                                            </svg> 
                                        </span>
                                        <span class="fullscreen" title="Full Screen">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
                                              <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
                                            </svg>
                                        </span>
                                    </div>
                                    <div class="image-overlay"></div>`;
const DisplayedAllImageUrlList = [];
let currentImageIndex = 0;
const imageSlideshowElm = $('.image-slideshow');
const rightArrowElm = $('#right-arrow');
const leftArrowElm = $('#left-arrow');
const btnClose = $('#close');

loadAllImages();

btnUpload.on('click', () => overlay.removeClass('d-none'));

overlay.on('click', (evt) => {
    if (evt.target === overlay[0]) overlay.addClass('d-none');
});

$(document).on('keydown', (evt) => {
    if (evt.key === 'Escape' && !overlay.hasClass('d-none')) {
        overlay.addClass('d-none');
    }
});

overlay.on('dragover', (evt) => evt.preventDefault());

overlay.on('drop', (evt) => evt.preventDefault())

dropZoneElm.on('dragover', (evt) => evt.preventDefault());

dropZoneElm.on('drop', (evt) => {
    evt.preventDefault();
    const droppedFiles = evt.originalEvent.dataTransfer.files;
    const imageFiles = Array.from(droppedFiles).filter(file => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    overlay.addClass("d-none");
    uploadImages(imageFiles);
});


mainElm.on('click', '.image', function(event) {
    if (!$(event.target).closest('.download, .fullscreen').length) {
        imageSlideshowElm.removeClass('d-none');
        const imgDiv = $(event.target).closest('.image');
        const backgroundImageURL = imgDiv.css('background-image');
        const imageUrl = backgroundImageURL.slice(4, -1).replace(/"/g, "");

        setCurrentImageIndex(DisplayedAllImageUrlList.findIndex((value) => value === imageUrl));
        displaySlideshow();
    }
});

rightArrowElm.on('click', ()=>{
    setCurrentImageIndex(currentImageIndex+1);
    displaySlideshow();
});

leftArrowElm.on('click', ()=>{
    setCurrentImageIndex(currentImageIndex-1);
    displaySlideshow();
});

btnClose.on('click', (evt)=>{
    imageSlideshowElm.addClass('d-none');
});

mainElm.on('click', '.image .fullscreen', (event)=> {
    event.preventDefault();
    const actionElm = $(event.target).closest('.action');
    actionElm.addClass('d-none');

    const imageOverlayElm = $(event.target).closest('.image').children('.image-overlay');
    imageOverlayElm.addClass('d-none');

    const imageDivElm = $(event.target).closest('.image')[0]; // Access the DOM element
    imageDivElm.requestFullscreen();
});

mainElm.on('fullscreenchange', (event) => {
    if(!document.fullscreenElement){
        const actionElm = $(event.target).children('.action');
        actionElm.removeClass('d-none');

        const imageOverlayElm = $(event.target).children('.image-overlay');
        imageOverlayElm.removeClass('d-none');
    }
});

mainElm.on('click', '.image .download', (event) => {
    event.preventDefault();
    const imgDiv = $(event.target).closest('.image');
    const backgroundImageURL = imgDiv.css('background-image');
    const imageUrl = backgroundImageURL.slice(4, -1).replace(/"/g, "");
    const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    downloadImage(imageUrl,imageName);
});

function setCurrentImageIndex(newValue){
    if( newValue >= 0 && newValue < DisplayedAllImageUrlList.length) {
        currentImageIndex = newValue;
        if(currentImageIndex === 0) {
            leftArrowElm.css('transform', 'scale(0)');
        }else if(currentImageIndex === DisplayedAllImageUrlList.length-1){
            rightArrowElm.css('transform', 'scale(0)');
        }else if(currentImageIndex > 0 && currentImageIndex < DisplayedAllImageUrlList.length-1){
            leftArrowElm.css('transform', 'scale(1)');
            rightArrowElm.css('transform', 'scale(1)');
        }
    }

}

function displaySlideshow(){
    if (currentImageIndex >= 0 && currentImageIndex < DisplayedAllImageUrlList.length) {
        const currentImageDiv = $('#current-image');
        currentImageDiv.css('background-image', `url('${DisplayedAllImageUrlList[currentImageIndex]}')`);
    }
}

function uploadImages(imageFiles){
    const formData = new FormData();
    imageFiles.forEach(imageFile => {
        const divElm = $(`<div class="image loader"></div>`);
        divElm.append(cssLoaderHtml);
        mainElm.append(divElm);

        formData.append("images", imageFile);
    });
    const jqxhr = $.ajax(`${REST_API_URL}/images`, {
        method: 'POST',
        data: formData,
        contentType: false,
        processData: false
    });
    jqxhr.done((imageUrlList)=>{
        imageUrlList.forEach(imageUrl => {
            const index = DisplayedAllImageUrlList.findIndex((value) => value === imageUrl)
            if(index !== -1){
                alert(imageUrl + ": Already Exist");
            }else{
                const divElm = $(".image.loader").first();
                const actionAndImageOverlayDivs = $(actionAndImageOverlayHtml);
                divElm.css('background-image', `url('${imageUrl}')`);
                divElm.empty();
                divElm.removeClass('loader');
                divElm.append(actionAndImageOverlayDivs);
                DisplayedAllImageUrlList.push(imageUrl);
            }
        });
    });
    jqxhr.always(()=> $(".image.loader").remove());
}

function loadAllImages() {
    const jqxhr = $.ajax(`${REST_API_URL}/images`);

    jqxhr.done((imageUrlList)=>{
        imageUrlList.forEach(imageUrl => {
            const imgDiv = $(`<div class="image"></div>`);
            const actionAndImageOverlayDivs = $(actionAndImageOverlayHtml);
            imgDiv.append(actionAndImageOverlayDivs);
            imgDiv.css('background-image', `url('${imageUrl}')`);
            mainElm.append(imgDiv);
            DisplayedAllImageUrlList.push(imageUrl);
        });
    });

}

function downloadImage(imageUrl, imageName){

    const jqxhr = $.ajax({
        url: imageUrl,
        xhrFields: {
            responseType: 'blob'
        }
    });

    jqxhr.done((blob) => {
        let blobUrl = URL.createObjectURL(blob);
        let anchorElm = document.createElement('a');
        anchorElm.href = blobUrl;
        anchorElm.download = imageName;

        anchorElm.click();

        URL.revokeObjectURL(anchorElm.href);
    });

    jqxhr.fail(error => console.error('Error:', error));


}



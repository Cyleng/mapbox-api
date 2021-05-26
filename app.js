const placesList=document.getElementsByClassName('points-of-interest')[0];
const searchForm=document.querySelector('form');
let proximityPosition =[];
const markerList=[]
mapboxgl.accessToken = 'pk.eyJ1IjoiY2h5bGVuZyIsImEiOiJja3A1ano1b3kxd3Z6Mm9tdzg3MGJud2xmIn0.GF5aouiF52eVjjE_2icciw';
const map = new mapboxgl.Map({
container: "map",
zoom: 13,
style: 'mapbox://styles/mapbox/streets-v11'
});

function calculateDistance(startPosition,targetPosition){
    const earthRadius=6371e3;
    const phi1=startPosition[1]*Math.PI/180;
    const phi2=targetPosition[1]*Math.PI/180;
    const deltaPhi=(targetPosition[1]-startPosition[1])*Math.PI/180;
    const deltaLambda=(targetPosition[0]-startPosition[0])*Math.PI/180;

    const a=Math.sin(deltaPhi/2)*Math.sin(deltaPhi/2)+Math.cos(phi1)*Math.cos(phi2)*Math.sin(deltaLambda/2)*Math.sin(deltaLambda/2);
    const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    const d=earthRadius*c/1000;
    return d.toFixed(2);
}

const renderMap=async(toPosition)=>{

    await map.flyTo({center: toPosition, speed: 5})
    if(markerList.length!=0){
        markerList.pop().remove();
    }
    
    const marker= new mapboxgl.Marker().setLngLat(toPosition).addTo(map);
    markerList.push(marker);
    //console.log(marker)
}



navigator.geolocation.getCurrentPosition((position)=>{
    const { latitude, longitude } = position.coords;
    const currentPosition=[longitude, latitude];
    renderMap(currentPosition);
    proximityPosition=currentPosition;
});

const getSearchResults=async(keyWord, proximityPosition)=>{
    const URL="https://api.mapbox.com/geocoding/v5/mapbox.places/"+keyWord+".json?proximity="+proximityPosition[0]+","+proximityPosition[1]+"&access_token=pk.eyJ1IjoiY2h5bGVuZyIsImEiOiJja3A1ano1b3kxd3Z6Mm9tdzg3MGJud2xmIn0.GF5aouiF52eVjjE_2icciw&limit=10"
    const response=await fetch(URL);
    const data=await response.json();
    return data;
}

const renderSearchResults=async (data)=>{
    placesList.innerHTML="";
    data.features.forEach(element=>{
        console.log(element);
        console.log(calculateDistance(proximityPosition, element.center))
        placesList.insertAdjacentHTML("afterbegin",`
        <li data-long="${element.center[0]}" data-lat="${element.center[1]}">
            <ul class="poi" >
                <li class="name">${element.text}</li>
                <li class="street-address">${element.properties.address}</li>
                <li class="distance">${calculateDistance(proximityPosition, element.center)} KM</li>
            </ul>
        </li>
        `)
    })
    // const poiItems=document.getElementsByClassName('poi')
    // for(item of poiItems ){
    //     item.addEventListener('click',(e)=>{
    //         if (e.target.classList.contains("poi")){
    //             console.log(e.target);
    //         }
    //     })
    // }
    
    //     // element.addEventListener('click',(e)=>{
    //     //     e.preventDefault();
    //     //     console.log(e.target.dataset.long,e.target.dataset.lat);
    //     // })

}
searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const keyWord=e.target.elements.search.value;
    getSearchResults(keyWord,proximityPosition).then((data)=>{
        renderSearchResults(data)
    
    }).catch((err)=>console.log(err))
})

placesList.addEventListener('click', (e)=>{
    if(e.target.nodeName==="LI"&&e.target.parentElement.parentElement.nodeName==="LI"){
        const long=e.target.parentElement.parentElement.dataset.long;
        const lat=e.target.parentElement.parentElement.dataset.lat;
        renderMap([long,lat]);
    }
    
})
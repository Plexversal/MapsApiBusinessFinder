import fetchNearbyPlacesBing from './bing-maps-api/request'
import fetchNearbyPlacesGoogle  from './google-maps-api/request'

fetchNearbyPlacesGoogle(2000, `53.472526`, `-2.232580`, encodeURIComponent('restaurants'), true, true)
fetchNearbyPlacesBing(1, 100, `53.472526`, `-2.232580`, encodeURIComponent('restaurants'), true, true)
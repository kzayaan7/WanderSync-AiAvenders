// Curated high-resolution destination photography from Unsplash
const DESTINATION_IMAGES = {
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
  japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  pakistan: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1200&q=80',
  islamabad: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1200&q=80',
  hunza: 'https://images.unsplash.com/photo-1627894043063-82084326584f?auto=format&fit=crop&w=1200&q=80',
  skardu: 'https://images.unsplash.com/photo-1627894043063-82084326584f?auto=format&fit=crop&w=1200&q=80',
  lahore: 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?auto=format&fit=crop&w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  italy: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  nyc: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  alps: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  greece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  spain: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  uae: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  istanbul: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
  iceland: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
}

/**
 * Returns a high-quality destination photo URL based on destination string
 */
export function getDestinationImage(destinationName) {
  if (!destinationName) return DESTINATION_IMAGES.default
  const cleanName = destinationName.toLowerCase().replace(/[^a-z]/g, '')
  for (const key of Object.keys(DESTINATION_IMAGES)) {
    if (key !== 'default' && cleanName.includes(key)) {
      return DESTINATION_IMAGES[key]
    }
  }
  return DESTINATION_IMAGES.default
}

export const FEATURED_DESTINATIONS = [
  {
    name: 'Hunza & Skardu, Pakistan',
    image: DESTINATION_IMAGES.hunza,
    tag: 'Mountain Majesty',
    duration: '7 Days',
    budget: '₨ 180,000',
    description: 'Breathtaking Karakoram mountain peaks, turquoise Attabad Lake, historic forts, and serene valley views.'
  },
  {
    name: 'Kyoto & Tokyo, Japan',
    image: DESTINATION_IMAGES.tokyo,
    tag: 'Cultural Odyssey',
    duration: '7 Days',
    budget: '$1,800',
    description: 'Explore historic temples, serene bamboo groves, vibrant neon streets, and world-class culinary delights.'
  },
  {
    name: 'Santorini & Islands, Greece',
    image: DESTINATION_IMAGES.santorini,
    tag: 'Coastal & Sunset',
    duration: '5 Days',
    budget: '$1,500',
    description: 'Iconic whitewashed clifftop villages, Aegean sea views, volcanic beaches, and Mediterranean cuisine.'
  },
  {
    name: 'Swiss Alps, Switzerland',
    image: DESTINATION_IMAGES.alps,
    tag: 'Alpine Adventure',
    duration: '6 Days',
    budget: '$2,400',
    description: 'Majestic mountain peaks, scenic panoramic train rides, alpine hiking trails, and cozy mountain chalets.'
  }
]

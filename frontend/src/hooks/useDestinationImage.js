import { useEffect, useState } from 'react'
import { apiService } from '../services/apiService'
import { getDestinationImage } from '../utils/destinationImages'

// Module-level cache shared by every component using this hook, so the same
// destination is only ever looked up once per page session.
const imageCache = new Map()

/**
 * Returns a real photo URL for a destination, backed by the Wikipedia image
 * API (see backend /api/v1/media/destination-image) instead of the old fixed
 * list of ~20 hardcoded Unsplash links. While the lookup is in flight, or if
 * it fails / finds nothing, this falls back to the small local curated map
 * (destinationImages.js) so a photo is always shown immediately, never a
 * blank card.
 */
export function useDestinationImage(destinationName) {
    const fallback = getDestinationImage(destinationName)
    const [imageUrl, setImageUrl] = useState(imageCache.get(destinationName) || fallback)

    useEffect(() => {
        let cancelled = false
        if (!destinationName) {
            setImageUrl(fallback)
            return
        }
        if (imageCache.has(destinationName)) {
            setImageUrl(imageCache.get(destinationName))
            return
        }

        apiService.getDestinationImage(destinationName)
            .then((res) => {
                if (cancelled) return
                const url = res?.url || fallback
                imageCache.set(destinationName, url)
                setImageUrl(url)
            })
            .catch(() => {
                if (!cancelled) setImageUrl(fallback)
            })

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destinationName])

    return imageUrl
}
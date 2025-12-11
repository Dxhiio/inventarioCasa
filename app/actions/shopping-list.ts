'use server'

import { createClient } from '@/utils/supabase/server'
import { Database } from '@/types/supabase'
import * as cheerio from 'cheerio'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export interface ShoppingListItem {
  id: number
  name: string
  current_quantity: number
  suggested_quantity: number
  prices: {
      ml: { price: number, url: string, isRealPrice?: boolean },
      sams: { price: number, url: string, isRealPrice?: boolean }
  }
  reason: 'low_stock' | 'expiring'
}

export async function getShoppingCandidates() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Fetch all items for the user
  const { data } = await supabase
    .from('inventory_items')
    .select('*, categories(name)')
    .eq('is_consumed', true)
  
  const items = data || []

  const HIGH_VELOCITY_CATEGORIES = ['Alimentos', 'Bebidas', 'Salud', 'Mascotas', 'Limpieza', 'Higiene']
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const main: ShoppingListItem[] = []
  const recommended: ShoppingListItem[] = []

  items.forEach((item: any) => {
      const catName = item.categories?.name || 'Varios'
      const isHighVelocity = HIGH_VELOCITY_CATEGORIES.some(c => catName.includes(c))
      
      const isExpiring = item.expiry_date 
         ? new Date(item.expiry_date) < threeDaysFromNow 
         : false
      
      // Logic:
      // Main: High Velocity Low Stock OR Expiring
      // Recommended: Low Velocity Low Stock (User decides)
      
      const threshold = 1 // Standard 'Low Stock' definition
      const isLow = item.quantity <= threshold

      if (!isLow && !isExpiring) return

      const listItem: ShoppingListItem = {
          id: item.id,
          name: item.name,
          current_quantity: item.quantity,
          suggested_quantity: 1,
          prices: { 
              ml: { price: 0, url: '', isRealPrice: false }, 
              sams: { price: 0, url: '', isRealPrice: false } 
          },
          reason: isExpiring ? 'expiring' : 'low_stock'
      }

      if (isExpiring || (isHighVelocity && isLow)) {
          main.push(listItem)
      } else if (!isHighVelocity && isLow) {
          recommended.push(listItem)
      }
  })

  return { main, recommended }
}

export async function fetchProductPrices(query: string) {
    console.log(`[PriceCheck] Fetching live prices for: ${query}`)
    const [priceML, priceSams] = await Promise.all([
        estimatePriceML(query),
        estimatePriceSams(query, true)
    ])
    return { ml: priceML, sams: priceSams }
}

// Legacy wrapper if needed, or remove.
// For now, removing generateSmartShoppingList as the UI will change.

async function estimatePriceML(query: string) {
    try {
        const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}_NoIndex_True`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 }
        })

        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)

        const html = await response.text()
        const $ = cheerio.load(html)
        const firstPriceElement = $('.ui-search-layout__item').first().find('.andes-money-amount__fraction').first()
        
        let price = 0
        if (firstPriceElement.length) {
            price = parseInt(firstPriceElement.text().replace(/\D/g, '')) || 0
        }

        if (price > 0) {
            return { price, url, isRealPrice: true }
        }
        throw new Error('No price found')
    } catch (error) {
        // console.warn(`ML Scraping failed for ${query}`, error)
        const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return { price: (seed % 180) + 20, url: `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`, isRealPrice: false }
    }
}

async function estimatePriceSams(query: string, tryScrape = false) {
    const email = process.env.SAMS_EMAIL
    const password = process.env.SAMS_PASSWORD

    console.log(`[Sams] Estimating price for: "${query}". TryScrape: ${tryScrape}`)

    if (tryScrape) {
        try {
            // Experimental: Attempt real scraping for expiring items
            
            // 1. Attempt Login/Auth if credentials exist (Requested by user)
            let authCookies = ''
            if (email && password) {
                console.log(`[Sams] Credentials found. Attempting login for ${email}...`)
                try {
                     // Note: Real login requires CSRF tokens, dynamic cookies, and bypassing ReCaptcha/BotDefense.
                     // This is a "Best Effort" attempt using standard fetch as requested.
                     const loginResponse = await fetch('https://www.sams.com.mx/api/v1/login', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ email, password })
                     })
                     if (loginResponse.ok) {
                         const setCookie = loginResponse.headers.get('set-cookie')
                         if (setCookie) {
                            authCookies = setCookie
                            console.log('[Sams] Login success (simulated), cookie obtained.')
                         }
                     } else {
                        console.log(`[Sams] Login attempt declined: ${loginResponse.status}`)
                     }
                } catch (loginError) {
                    console.warn("[Sams] Login attempt error:", loginError)
                }
            } else {
                console.log('[Sams] No credentials in env items.')
            }

            // 2. Perform Search with (optional) Auth Cookies
            console.log(`[Sams] Scraping URL: https://www.sams.com.mx/search?q=${encodeURIComponent(query)}`)
            const url = `https://www.sams.com.mx/search?q=${encodeURIComponent(query)}`
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Cookie': authCookies
                },
                cache: 'no-store' // Critical: User reported stale results
            })

            if (response.ok) {
                const html = await response.text()
                
                // Debugging removed for production


                // Strategy: Next.js Hydration Data (Most reliable for SPA)
                const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>(.*?)<\/script>/)
                if (nextDataMatch && nextDataMatch[1]) {
                    try {
                        const json = JSON.parse(nextDataMatch[1])
                        const items = json?.props?.pageProps?.initialData?.searchResult?.itemStacks?.[0]?.items || []
                        
                        // Log found items for debugging
                        console.log(`[Sams] Found ${items.length} items in Next.js data header.`)

                        // Best Match Logic
                        let bestItem = null
                        let maxScore = -1
                        // Normalize query words
                        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
                        const headWord = queryWords[0]
                        const headRoot = headWord?.endsWith('s') ? headWord.slice(0, -1) : headWord

                        for (const item of items) {
                            // Try multiple price fields
                            const priceVal = item.price || item.priceInfo?.price || parseFloat(item.priceInfo?.linePrice?.replace(/[$,]/g, '') || '0')
                            
                            if (priceVal > 0 && item.name) {
                                const itemNameNorm = item.name.toLowerCase()
                                let score = 0
                                
                                // 1. CRITICAL: Head Word Priority (The "Noun")
                                // If the item STARTS with the user's first word (or its root), it's almost certainly the right item.
                                if (headRoot && itemNameNorm.startsWith(headRoot)) {
                                    score += 10 // Massive bonus for starting with "Huevo"
                                } else if (headRoot && itemNameNorm.includes(headRoot)) {
                                    score += 3  // Big bonus for containing "Huevo" anywhere
                                }

                                // 2. General Word Match
                                queryWords.forEach(word => {
                                    if (itemNameNorm.includes(word)) {
                                        score += 1
                                    } else {
                                        // Stem match
                                        const root = word.endsWith('s') ? word.slice(0, -1) : word
                                        if (root.length > 2 && itemNameNorm.includes(root)) {
                                            score += 0.5
                                        }
                                    }
                                })

                                console.log(`[Sams Debug] Item: "${item.name}" Score: ${score.toFixed(1)} Price: ${priceVal}`)

                                if (score > maxScore) {
                                    maxScore = score
                                    bestItem = { ...item, price: priceVal }
                                }
                            }
                        }

                        if (bestItem && maxScore > 0) {
                            console.log(`[Sams] Selected Best Match: "${bestItem.name}" (Score: ${maxScore.toFixed(1)}) - Price: ${bestItem.price}`)
                            return { price: bestItem.price, url, isRealPrice: true }
                        } else {
                            console.log(`[Sams] No good match found (MaxScore: ${maxScore})`)
                        }
                    } catch (err) {
                        console.warn("[Sams] Failed to parse __NEXT_DATA__:", err)
                    }
                }

                // Fallback Strategy: Cheerio Selectors (Legacy/SSR support)
                const $ = cheerio.load(html)
                
                // Strategy 2: JSON-LD
                let price = 0
                $('script[type="application/ld+json"]').each((_, el) => {
                    try {
                        const json = JSON.parse($(el).html() || '{}')
                        if (json['@type'] === 'Product' && json.offers?.price) {
                            price = parseFloat(json.offers.price)
                        } else if (json['@type'] === 'ItemList' && json.itemListElement?.[0]?.offers?.price) {
                             price = parseFloat(json.itemListElement[0].offers.price)
                        }
                    } catch (e) { }
                })
                
                // Strategy 3: Visual Selectors
                if (price === 0) {
                     const priceText = $('.samsb-price-text').first().text() || $('.curr-price').first().text()
                     if (priceText) {
                         price = parseFloat(priceText.replace(/[$,]/g, ''))
                     }
                }

                if (price > 0) {
                    console.log(`[Sams] Found price via DOM selectors: ${price}`)
                    return { price, url, isRealPrice: true }
                }
            }
        } catch (e) {
            console.warn("Sams scraping failed", e)
        }
    }

    // Fallback: Mock Logic
    try {
         const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0) + 5, 0)
         const basePrice = (seed % 250) + 50 
         
         return {
             price: basePrice,
             url: `https://www.sams.com.mx/search?q=${encodeURIComponent(query)}`,
             isRealPrice: false
         }
    } catch (error) {
        return { price: 0, url: '', isRealPrice: false }
    }
}

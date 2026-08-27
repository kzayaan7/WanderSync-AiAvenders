import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, DollarSign, Sparkles, Tag, Sliders, Globe } from 'lucide-react'

const COUNTRY_CITIES = {
  'Argentina': ['Buenos Aires', 'Bariloche', 'Mendoza', 'Córdoba'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast', 'Adelaide'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz'],
  'Belgium': ['Brussels', 'Bruges', 'Ghent', 'Antwerp'],
  'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Florianópolis'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Banff', 'Quebec City', 'Calgary'],
  'China': ['Beijing', 'Shanghai', 'Xi\'an', 'Chengdu', 'Guangzhou', 'Hangzhou'],
  'Egypt': ['Cairo', 'Luxor', 'Aswan', 'Sharm El Sheikh', 'Alexandria'],
  'France': ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Strasbourg'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Dresden'],
  'Greece': ['Santorini', 'Athens', 'Mykonos', 'Crete', 'Rhodes'],
  'India': ['New Delhi', 'Mumbai', 'Jaipur', 'Goa', 'Agra', 'Bangalore', 'Kerala'],
  'Indonesia': ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Ubud'],
  'Ireland': ['Dublin', 'Galway', 'Cork', 'Killarney'],
  'Italy': ['Rome', 'Florence', 'Venice', 'Milan', 'Naples', 'Amalfi'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo', 'Hiroshima', 'Fukuoka', 'Nara'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca'],
  'Mexico': ['Mexico City', 'Cancún', 'Oaxaca', 'Guadalajara', 'Tulum'],
  'Morocco': ['Marrakech', 'Fes', 'Chefchaouen', 'Casablanca'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague'],
  'New Zealand': ['Auckland', 'Queenstown', 'Wellington', 'Christchurch'],
  'Norway': ['Oslo', 'Bergen', 'Tromsø', 'Lofoten'],
  'Pakistan': ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Peshawar', 'Quetta', 'Skardu', 'Hunza', 'Multan'],
  'Portugal': ['Lisbon', 'Porto', 'Algarve', 'Sintra', 'Madeira'],
  'Qatar': ['Doha', 'Al Wakrah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'AlUla'],
  'Singapore': ['Singapore City', 'Sentosa'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Kruger National Park'],
  'South Korea': ['Seoul', 'Busan', 'Jeju Island', 'Incheon'],
  'Spain': ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Ibiza', 'Granada'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö'],
  'Switzerland': ['Zurich', 'Geneva', 'Lucerne', 'Interlaken', 'Zermatt'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Koh Samui', 'Krabi'],
  'Turkey': ['Istanbul', 'Cappadocia', 'Antalya', 'Bodrum', 'Izmir'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Bath', 'Oxford'],
  'United States': ['New York', 'San Francisco', 'Los Angeles', 'Miami', 'Chicago', 'Las Vegas', 'Seattle'],
  'Vietnam': ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Ha Long Bay', 'Hoi An'],
  'Other / Custom': []
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'PKR', symbol: '₨', name: 'PKR (₨)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)' },
  { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'AUD (AU$)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)' },
  { code: 'AED', symbol: 'AED', name: 'AED (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'SAR (SAR)' },
  { code: 'CHF', symbol: 'CHF', name: 'CHF (CHF)' },
  { code: 'SGD', symbol: 'SG$', name: 'SGD (SG$)' },
  { code: 'MYR', symbol: 'RM', name: 'MYR (RM)' },
  { code: 'THB', symbol: '฿', name: 'THB (฿)' },
  { code: 'TRY', symbol: '₺', name: 'TRY (₺)' },
]

export default function ItineraryForm({ user, onRequireAuth, extractedParams, onGenerate, isGenerating }) {
  const [selectedCountry, setSelectedCountry] = useState('Pakistan')
  const [selectedCity, setSelectedCity] = useState('Islamabad')
  const [customCity, setCustomCity] = useState('')
  const [customCountry, setCustomCountry] = useState('')
  const [currency, setCurrency] = useState('PKR')
  const [startDate, setStartDate] = useState('2026-10-10')
  const [endDate, setEndDate] = useState('2026-10-14')
  const [budgetCategory, setBudgetCategory] = useState('moderate')
  const [totalBudget, setTotalBudget] = useState(150000)
  const [interests, setInterests] = useState('culture, local food, historical sites')

  const currencyObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  useEffect(() => {
    if (extractedParams) {
      if (extractedParams.destination) {
        const destStr = extractedParams.destination
        let foundCountry = ''
        let foundCity = ''

        for (const [country, cities] of Object.entries(COUNTRY_CITIES)) {
          if (destStr.toLowerCase().includes(country.toLowerCase())) {
            foundCountry = country
          }
          for (const city of cities) {
            if (destStr.toLowerCase().includes(city.toLowerCase())) {
              foundCity = city
              if (!foundCountry) foundCountry = country
            }
          }
        }

        if (foundCountry) {
          setSelectedCountry(foundCountry)
          if (foundCity) setSelectedCity(foundCity)
        } else {
          setSelectedCountry('Other / Custom')
          setCustomCountry(destStr)
        }
      }

      if (extractedParams.budget_category) setBudgetCategory(extractedParams.budget_category)
      if (extractedParams.total_budget) setTotalBudget(extractedParams.total_budget)
      if (extractedParams.interests && extractedParams.interests.length > 0) {
        setInterests(extractedParams.interests.join(', '))
      }
    }
  }, [extractedParams])

  const handleCountryChange = (e) => {
    const country = e.target.value
    setSelectedCountry(country)
    if (COUNTRY_CITIES[country] && COUNTRY_CITIES[country].length > 0) {
      setSelectedCity(COUNTRY_CITIES[country][0])
    } else {
      setSelectedCity('Custom')
    }
  }

  const getFinalDestination = () => {
    if (selectedCountry === 'Other / Custom') {
      return customCountry || customCity || 'Custom Location'
    }
    const city = selectedCity === 'Custom' ? customCity : selectedCity
    return city ? `${city}, ${selectedCountry}` : selectedCountry
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!user) {
      onRequireAuth?.()
      return
    }
    const finalDestination = getFinalDestination()
    const interestList = interests.split(',').map((i) => i.trim()).filter(Boolean)
    
    onGenerate({
      destination: finalDestination,
      country: selectedCountry,
      city: selectedCity === 'Custom' ? customCity : selectedCity,
      currency: currencyObj.code,
      currency_symbol: currencyObj.symbol,
      start_date: startDate,
      end_date: endDate,
      budget_category: budgetCategory,
      total_budget: parseFloat(totalBudget),
      interests: interestList
    })
  }

  const availableCities = COUNTRY_CITIES[selectedCountry] || []

  return (
    <div className="wandermap-card p-6 rounded-3xl shadow-soft-md border border-slate-200/90 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900 font-display">Trip Specifications</h3>
          <p className="text-[11px] text-slate-500">Customize location, currency & budget parameters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">

        {/* Country & City Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Country Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Country ({Object.keys(COUNTRY_CITIES).length - 1} Available)</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium appearance-none cursor-pointer"
              >
                {Object.keys(COUNTRY_CITIES).map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Region</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
              {selectedCountry !== 'Other / Custom' && availableCities.length > 0 ? (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium appearance-none cursor-pointer"
                >
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="Custom">+ Other City...</option>
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={selectedCountry === 'Other / Custom' ? customCountry : customCity}
                  onChange={(e) => selectedCountry === 'Other / Custom' ? setCustomCountry(e.target.value) : setCustomCity(e.target.value)}
                  placeholder="Enter city or location..."
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium"
                />
              )}
            </div>
          </div>
        </div>

        {/* Custom City input if 'Custom' selected inside a country */}
        {selectedCountry !== 'Other / Custom' && selectedCity === 'Custom' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Custom City Name</label>
            <input
              type="text"
              required
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Type custom city name..."
              className="w-full px-3.5 py-2.5 rounded-xl wandermap-input text-xs font-medium"
            />
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl wandermap-input text-xs font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl wandermap-input text-xs font-medium"
            />
          </div>
        </div>

        {/* Budget & Currency Dropdown */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Total Budget</span>
            </label>
            
            {/* Currency Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 cursor-pointer shadow-sm focus:outline-none"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.name}</option>
                  ))}
                </select>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-primary bg-[#0F766E] text-white shadow-sm">
                {currencyObj.symbol}{Number(totalBudget).toLocaleString()}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={currency === 'PKR' ? 10000 : currency === 'JPY' ? 10000 : 200}
            max={currency === 'PKR' ? 2000000 : currency === 'JPY' ? 1500000 : 10000}
            step={currency === 'PKR' ? 5000 : currency === 'JPY' ? 5000 : 100}
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Budget ({currencyObj.symbol}{currency === 'PKR' ? '10k' : '200'})</span>
            <span>Moderate ({currencyObj.symbol}{currency === 'PKR' ? '200k' : '1.5k'})</span>
            <span>Luxury ({currencyObj.symbol}{currency === 'PKR' ? '2M+' : '10k+'})</span>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Interests & Tags</label>
          <div className="relative">
            <Tag className="w-4 h-4 text-primary absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. food markets, museums, hiking, cafes"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl wandermap-input text-xs sm:text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-secondary bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs sm:text-sm shadow-coral transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white font-extrabold">{isGenerating ? 'Synthesizing Itinerary...' : user ? 'Generate AI Itinerary' : 'Sign In to Generate Itinerary'}</span>
        </button>

      </form>
    </div>
  )
}

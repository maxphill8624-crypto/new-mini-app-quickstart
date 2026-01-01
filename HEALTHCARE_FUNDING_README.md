# Healthcare Funding Lookup Feature

This application now includes a powerful **Healthcare Funding Lookup** tool that allows users to search for home healthcare businesses in Aurora/Denver, CO and discover their government funding history.

## Features

### 1. Business Discovery
- Search for home healthcare businesses using Google Maps Places API
- View business details including:
  - Business name and address
  - Rating and review count
  - Operational status
  - Location on map

### 2. Government Funding Analysis
- Fetch funding data from multiple government sources:
  - **USAspending.gov** - Federal spending and contracts
  - **Small Business Administration (SBA)** - Business loans and grants
  - **Department of Health and Human Services (HHS)** - Healthcare-specific funding
- View comprehensive funding details:
  - Total funding amount received
  - Number of funding records
  - Individual award details (amount, date, agency, type)

### 3. User-Friendly Interface
- Beautiful gradient UI design
- Real-time search and data fetching
- Detailed funding breakdowns
- Mobile-responsive design

## Setup Instructions

### Prerequisites
- Google Maps API Key with Places API enabled
- Node.js and npm installed

### Installation

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Configure environment variables**:

   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_URL=http://localhost:3000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

3. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Places API**
   - Create credentials (API Key)
   - Copy the API key to your `.env.local` file

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Access the Healthcare Funding Lookup**:
   - Navigate to `http://localhost:3000`
   - Click the "Healthcare Funding Lookup" button
   - Or go directly to `http://localhost:3000/healthcare-funding`

## How to Use

### Searching for Businesses

1. On the Healthcare Funding Lookup page, you'll see a search box
2. The default location is set to "Aurora, CO"
3. You can change the location to search other areas (e.g., "Denver, CO")
4. Click "Search Businesses" to find home healthcare providers

### Checking Funding Data

1. Once businesses are displayed, each card shows basic business information
2. Click the "Check Government Funding" button on any business
3. The app will search multiple government databases for funding records
4. Results will show:
   - Total funding amount
   - Number of funding records found
   - Detailed breakdown of each funding award

### Understanding the Results

- **Green amounts** indicate funding received
- **Source badges** show which database the funding came from
- **No records found** means the business either hasn't received federal funding or operates under a different legal name

## API Routes

### `/api/healthcare`
- **Method**: GET
- **Query Parameters**:
  - `location` (optional) - Location to search (default: "Aurora, CO")
- **Returns**: List of home healthcare businesses

### `/api/funding`
- **Method**: POST
- **Body**:
  ```json
  {
    "businessName": "Business Name",
    "address": "Business Address"
  }
  ```
- **Returns**: Funding data from multiple government sources

## Data Sources

### Google Maps Places API
- Provides business information, ratings, and locations
- Real-time data from Google Maps
- Requires API key

### USAspending.gov
- Free, public API (no API key required)
- Federal spending data including:
  - Grants
  - Loans
  - Contracts
  - Awards

### Government Agencies Searched
- **All Federal Agencies** - General federal funding
- **Small Business Administration (SBA)** - Business loans and grants
- **Department of Health and Human Services (HHS)** - Healthcare-specific funding

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS Modules
- **API Integration**: Axios
- **Data Sources**: Google Maps Places API, USAspending.gov API

## Important Notes

### Funding Data Accuracy
- Funding records are based on the exact business name match
- Some businesses may operate under different legal names (DBA vs legal entity)
- Parent companies may receive funding under a different name
- The data only includes federal funding, not state or local grants

### API Limitations
- Google Maps Places API has usage limits (check your quota)
- USAspending.gov API is free but has rate limiting
- Some funding records may take time to appear in government databases

### Privacy and Security
- All API keys should be kept in `.env.local` (never commit to git)
- The `.env.local` file is included in `.gitignore`
- Google Maps API key should be restricted to your domain in production

## Future Enhancements

Potential improvements for this feature:
- Add state and local funding databases
- Include Medicare/Medicaid payment data
- Export results to CSV/PDF
- Save favorite searches
- Email alerts for new funding opportunities
- Map visualization of all businesses
- Filter by funding amount or date range

## Troubleshooting

### "Google Maps API key not configured"
- Make sure you've added `GOOGLE_MAPS_API_KEY` to your `.env.local` file
- Restart the development server after adding environment variables

### No businesses found
- Check that the location is valid (city, state format)
- Try broader search terms (e.g., "Colorado" instead of "Aurora, CO")
- Verify your Google Maps API key is valid and has Places API enabled

### No funding records found
- This is normal for many businesses - they may not have received federal funding
- Try searching the business name exactly as it appears in government records
- Check if the business operates under a parent company name

## Support

For issues or questions:
- Check the main README.md for general setup instructions
- Review the [Google Maps Places API documentation](https://developers.google.com/maps/documentation/places/web-service)
- Review the [USAspending.gov API documentation](https://api.usaspending.gov/)

## License

This project is part of the Base Mini App ecosystem. Refer to the main project license.

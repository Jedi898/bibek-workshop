'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'ne'

const translations: Record<string, Record<Language, string>> = {
  // Sidebar
  'Script Editor': { en: 'Script Editor', ne: 'स्क्रिप्ट सम्पादक' },
  'Scene Breakdown': { en: 'Scene Breakdown', ne: 'दृश्य विवरण' },
  'Characters': { en: 'Characters', ne: 'पात्रहरू' },
  'Locations': { en: 'Locations', ne: 'स्थानहरू' },
  'Contacts': { en: 'Contacts', ne: 'सम्पर्कहरू' },
  'Schedule': { en: 'Schedule', ne: 'कार्यतालिका' },
  'Continuity Sheet': { en: 'Continuity Sheet', ne: 'कन्टिन्युटी सिट' },
  'Notes': { en: 'Notes', ne: 'नोटहरू' },
  'Weather': { en: 'Weather', ne: 'मौसम' },
  'Budget': { en: 'Budget', ne: 'बजेट' },
  'Shot Planning': { en: 'Shot Planning', ne: 'शट योजना' },
  'Screenwriting App': { en: 'Screenwriting App', ne: 'पटकथा लेखन एप' },

  // Common
  'Date': { en: 'Date', ne: 'मिति' },
  'Description': { en: 'Description', ne: 'विवरण' },
  'Remarks': { en: 'Remarks', ne: 'कैफियत' },
  'Location': { en: 'Location', ne: 'स्थान' },
  'Import JSON': { en: 'Import JSON', ne: 'JSON आयात गर्नुहोस्' },
  'Export JSON': { en: 'Export JSON', ne: 'JSON निर्यात गर्नुहोस्' },
  'Import Successful': { en: 'Import Successful', ne: 'आयात सफल भयो' },
  'Invalid File': { en: 'Invalid File', ne: 'अमान्य फाइल' },
  'Import PDF': { en: 'Import PDF', ne: 'PDF आयात गर्नुहोस्' },
  'Processing...': { en: 'Processing...', ne: 'प्रशोधन गर्दै...' },  'Preeti font detected, converting to Unicode...': { en: 'Preeti font detected, converting to Unicode...', ne: 'प्रीति फन्ट पत्ता लाग्यो, युनिकोडमा रूपान्तरण गर्दै...' },
  'Kantipur font detected, converting to Unicode...': { en: 'Kantipur font detected, converting to Unicode...', ne: 'कान्तिपुर फन्ट पत्ता लाग्यो, युनिकोडमा रूपान्तरण गर्दै...' },
  'Import Word': { en: 'Import Word', ne: 'वर्ड आयात गर्नुहोस्' },
  'Import with AI': { en: 'Import with AI', ne: 'AI बाट आयात गर्नुहोस्' },
  'AI is analyzing...': { en: 'AI is analyzing...', ne: 'AI ले विश्लेषण गर्दैछ...' },
  'Convert Legacy Font': { en: 'Convert Legacy Font', ne: 'लिगेसी फन्ट रूपान्तरण' },
  
  // Script Editor Search
  'Search by Character': { en: 'Search by Character', ne: 'पात्रद्वारा खोज्नुहोस्' },
  'Search': { en: 'Search', ne: 'खोज्नुहोस्' },
  'Search Results': { en: 'Search Results', ne: 'खोज परिणामहरू' },
  'No results found.': { en: 'No results found.', ne: 'कुनै परिणाम फेला परेन।' },

  'Clear': { en: 'Clear', ne: 'खाली गर्नुहोस्' },
  // Editor Toolbar
  'Bold': { en: 'Bold', ne: 'बोल्ड' },
  'Italic': { en: 'Italic', ne: 'इटालिक' },
  'Underline': { en: 'Underline', ne: 'अन्डरलाइन' },
  'Align Left': { en: 'Align Left', ne: 'बायाँ' },
  'Align Center': { en: 'Align Center', ne: 'केन्द्र' },
  'Align Right': { en: 'Align Right', ne: 'दायाँ' },

  // Detailed Scene Breakdown
  'Element (तत्त्व)': { en: 'Element (तत्त्व)', ne: 'तत्त्व (Element)' },
  'Details (विवरण)': { en: 'Details (विवरण)', ne: 'विवरण (Details)' },
  'Characters (पात्रहरू)': { en: 'Characters (पात्रहरू)', ne: 'पात्रहरू (Characters)' },
  'Key Props (मुख्य प्रॉप्स)': { en: 'Key Props (मुख्य प्रॉप्स)', ne: 'मुख्य प्रॉप्स (Key Props)' },
  'Background Props': { en: 'Background Props', ne: 'पृष्ठभूमि सामग्री' },
  'Wardrobe/Makeup': { en: 'Wardrobe/Makeup', ne: 'वस्त्र/मेकअप' },
  'Special Requirements': { en: 'Special Requirements', ne: 'विशेष आवश्यकताहरू' },
  'Notes for Director/DP': { en: 'Notes for Director/DP', ne: 'निर्देशक/डीपीका लागि नोट' },
  'Mood': { en: 'Mood', ne: 'मनोदशा' },
  'View Reports': { en: 'View Reports', ne: 'रिपोर्टहरू हेर्नुहोस्' },
  'Consolidated Reports': { en: 'Consolidated Reports', ne: 'एकीकृत रिपोर्टहरू' },
  'Master Character List': { en: 'Master Character List', ne: 'मुख्य पात्र सूची' },
  'Master Prop List': { en: 'Master Prop List', ne: 'मुख्य सामग्री सूची' },
  'Departmental Summaries': { en: 'Departmental Summaries', ne: 'विभागीय सारांश' },
  'Art Department': { en: 'Art Department', ne: 'कला विभाग' },
  'Costume & MUA': { en: 'Costume & MUA', ne: 'वस्त्र र मेकअप' },
  'Production Sound': { en: 'Production Sound', ne: 'उत्पादन ध्वनि' },

  // Scene Breakdown
  'Add Scene': { en: '+ Add Scene', ne: '+ दृश्य थप्नुहोस्' },
  'Scene No.': { en: 'Scene No.', ne: 'दृश्य नं.' },
  'I/E': { en: 'I/E', ne: 'आ/बा' },
  'D/N': { en: 'D/N', ne: 'दि/रा' },
  'Pages': { en: 'Pages', ne: 'पृष्ठ' },
  'Brief description...': { en: 'Brief description...', ne: 'संक्षिप्त विवरण...' },

  // Continuity
  'Undo': { en: 'Undo', ne: 'पूर्ववत' },
  'Redo': { en: 'Redo', ne: 'पुनः' },
  'Save': { en: 'Save', ne: 'सेभ' },
  'Reset': { en: 'Reset', ne: 'रिसेट' },
  'Export PDF': { en: 'Export PDF', ne: 'PDF निर्यात' },
  'Add Row': { en: '+ Add Row', ne: '+ पङ्क्ति थप्नुहोस्' },
  'First Take Time': { en: 'First Take Time', ne: 'पहिलो टेक समय' },
  'Pack Up Time': { en: 'Pack Up Time', ne: 'प्याक अप समय' },
  'Shot': { en: 'Shot', ne: 'शट' },
  'Take': { en: 'Take', ne: 'टेक' },
  'Sound No.': { en: 'Sound No.', ne: 'ध्वनि नं.' },
  'File No.': { en: 'File No.', ne: 'फाइल नं.' },
  'Sheet saved successfully!': { en: 'Sheet saved successfully!', ne: 'सिट सफलतापूर्वक सेभ भयो!' },
  'Are you sure you want to clear all data?': { en: 'Are you sure you want to clear all data?', ne: 'के तपाइँ निश्चित रूपमा सबै डाटा हटाउन चाहनुहुन्छ?' },

  // Schedule
  'Daily Schedule': { en: 'Daily Schedule', ne: 'दैनिक कार्यतालिका' },
  'General Timing': { en: 'General Timing', ne: 'सामान्य समय' },
  'Call Time': { en: 'Call Time', ne: 'कल टाइम' },
  'Breakfast': { en: 'Breakfast', ne: 'नाश्ता' },
  'Lunch': { en: 'Lunch', ne: 'खाना' },
  'Dinner': { en: 'Dinner', ne: 'रात्रिभोज' },
  'Schedule Details': { en: 'Schedule Details', ne: 'कार्यतालिका विवरण' },
  'Add Entry': { en: '+ Add Entry', ne: '+ प्रविष्टि थप्नुहोस्' },
  'Artist Name': { en: 'Artist Name', ne: 'कलाकारको नाम' },
  'Int/Ext': { en: 'Int/Ext', ne: 'आ/बा' },
  'Property': { en: 'Property', ne: 'सामग्री (Props)' },
  'Artist': { en: 'Artist', ne: 'कलाकार' },
  'Props/Notes': { en: 'Props/Notes', ne: 'सामग्री/नोटहरू' },
  'No schedule entries yet. Click "Add Entry" to begin.': { en: 'No schedule entries yet. Click "Add Entry" to begin.', ne: 'कुनै कार्यतालिका प्रविष्टि छैन। सुरु गर्न "प्रविष्टि थप्नुहोस्" क्लिक गर्नुहोस्।' },

  // Weather
  'Real-time Weather': { en: 'Real-time Weather', ne: 'वास्तविक समय मौसम' },
  'Loading weather data...': { en: 'Loading weather data...', ne: 'मौसम डाटा लोड हुँदैछ...' },
  'Wind Speed': { en: 'Wind Speed', ne: 'हावाको गति' },
  'Wind Direction': { en: 'Wind Direction', ne: 'हावाको दिशा' },
  'Sunrise': { en: 'Sunrise', ne: 'सूर्योदय' },
  'Sunset': { en: 'Sunset', ne: 'सूर्यास्त' },
  'Clear sky ☀️': { en: 'Clear sky ☀️', ne: 'सफा आकाश ☀️' },
  'Partly cloudy ⛅': { en: 'Partly cloudy ⛅', ne: 'आंशिक बादल ⛅' },
  'Fog 🌫️': { en: 'Fog 🌫️', ne: 'कुहिरो 🌫️' },
  'Drizzle 🌧️': { en: 'Drizzle 🌧️', ne: 'सिमसिमे पानी 🌧️' },
  'Rain 🌧️': { en: 'Rain 🌧️', ne: 'वर्षा 🌧️' },
  'Snow ❄️': { en: 'Snow ❄️', ne: 'हिउँ ❄️' },
  'Showers 🌦️': { en: 'Showers 🌦️', ne: 'पानी पर्ने 🌦️' },
  'Thunderstorm ⚡': { en: 'Thunderstorm ⚡', ne: 'मेघगर्जन ⚡' },
  'Unknown': { en: 'Unknown', ne: 'अज्ञात' },
  'Unknown Location': { en: 'Unknown Location', ne: 'अज्ञात स्थान' },

  // Shot Planning
  'Shot List': { en: 'Shot List', ne: 'शट सूची' },
  'Suggested Shots': { en: 'Suggested Shots', ne: 'सुझाव गरिएका शटहरू' },
  'Generate Plan': { en: 'Generate Plan', ne: 'योजना बनाउनुहोस्' },
  'Shot Type': { en: 'Shot Type', ne: 'शट प्रकार' },
  'Angle': { en: 'Angle', ne: 'कोण' },
  'Movement': { en: 'Movement', ne: 'चाल' },
  'Equipment': { en: 'Equipment', ne: 'उपकरण' },
  'Add Shot': { en: '+ Add Shot', ne: '+ शट थप्नुहोस्' },
  'Select a scene to plan shots': { en: 'Select a scene to plan shots', ne: 'शटहरू योजना गर्न दृश्य चयन गर्नुहोस्' },
  'No scenes available': { en: 'No scenes available', ne: 'कुनै दृश्य उपलब्ध छैन' },

  // Characters & Locations
  'Name': { en: 'Name', ne: 'नाम' },
  'Role': { en: 'Role', ne: 'भूमिका' },
  'Add Character': { en: '+ Add Character', ne: '+ पात्र थप्नुहोस्' },
  'Add Location': { en: '+ Add Location', ne: '+ स्थान थप्नुहोस्' },
  'Setting': { en: 'Setting', ne: 'सेटिङ' },
  'Are you sure you want to delete this item?': { en: 'Are you sure you want to delete this item?', ne: 'के तपाइँ निश्चित रूपमा यो वस्तु मेटाउन चाहनुहुन्छ?' },
  'Permit Status': { en: 'Permit Status', ne: 'अनुमति स्थिति' },
  'Required': { en: 'Required', ne: 'आवश्यक' },
  'Obtained': { en: 'Obtained', ne: 'प्राप्त भयो' },
  'Not Required': { en: 'Not Required', ne: 'आवश्यक छैन' },
  'Photo': { en: 'Photo', ne: 'फोटो' },
  'Upload Photo': { en: 'Upload Photo', ne: 'फोटो अपलोड गर्नुहोस्' },
  'Character Details': { en: 'Character Details', ne: 'पात्र विवरण' },
  'Close': { en: 'Close', ne: 'बन्द गर्नुहोस्' },
  'Delete': { en: 'Delete', ne: 'मेटाउनुहोस्' },
  'Location Details': { en: 'Location Details', ne: 'स्थान विवरण' },
  'Upload Permit Image': { en: 'Upload Permit Image', ne: 'अनुमति पत्रको फोटो अपलोड गर्नुहोस्' },
  'Permit Image': { en: 'Permit Image', ne: 'अनुमति पत्रको फोटो' },

  // Budget
  'Expenses': { en: 'Expenses', ne: 'खर्च' },
  'Amount (NPR)': { en: 'Amount (NPR)', ne: 'रकम (रु)' },
  'Category': { en: 'Category', ne: 'श्रेणी' },
  'Status': { en: 'Status', ne: 'स्थिति' },
  'Miti (BS)': { en: 'Miti (BS)', ne: 'मिति (वि.सं.)' },
  'Nepali Typing': { en: 'Nepali Typing', ne: 'नेपाली टाइपिङ' },
  'Virtual Keyboard': { en: 'Virtual Keyboard', ne: 'भर्चुअल किबोर्ड' }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isNepaliTyping: boolean
  setIsNepaliTyping: (val: boolean) => void
  showVirtualKeyboard: boolean
  setShowVirtualKeyboard: (val: boolean) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en')
  const [isNepaliTyping, setIsNepaliTyping] = useState(false)
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false)

  const t = (key: string) => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isNepaliTyping, setIsNepaliTyping, showVirtualKeyboard, setShowVirtualKeyboard }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
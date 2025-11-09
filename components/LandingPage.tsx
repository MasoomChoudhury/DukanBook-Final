import React, { useState } from 'react';
import Button from './common/Button';
import AuthModal from './AuthModal';

const CheckIcon = () => (
    <svg className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);


const PricingTier: React.FC<{ name: string; price: string; description: string; features: string[]; popular?: boolean; onSelect: () => void; }> = ({ name, price, description, features, popular, onSelect }) => (
    <div className={`border rounded-lg p-8 flex flex-col bg-white ${popular ? 'border-primary-500 relative shadow-2xl' : 'border-gray-200'}`}>
        {popular && <div className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white px-3 py-1 text-sm rounded-full font-semibold">Most Popular</div>}
        <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        <p className="text-gray-500 mt-2 flex-grow">{description}</p>
        <div className="my-8 text-center">
            <span className="text-5xl font-extrabold text-gray-900">₹{price}</span>
            <span className="text-gray-500 font-medium">/month</span>
        </div>
        <ul className="space-y-4 text-sm text-gray-600 mb-8">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                     <svg className="w-4 h-4 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Button onClick={onSelect} variant={popular ? 'primary' : 'secondary'} className="w-full mt-auto py-3">Get Started</Button>
    </div>
);


const LandingPage: React.FC = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const avatars = [
    "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
    "https://www.perfocal.com/blog/content/images/size/w960/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg",
    "https://t3.ftcdn.net/jpg/06/11/89/50/360_F_611895025_3sEm547mzOF1IKMBAVa4fJ7Ifq4z8Eye.jpg",
  ];

  const testimonials = [
    {
      name: "Amit Bhagat",
      role: "DukanBook Customer",
      quote: "I love how easy it is to collect coins after shopping. I've already saved over ₹500 this month!",
      rating: 5,
      image: "https://images.pexels.com/photos/7129125/pexels-photo-7129125.jpeg",
    },
    {
      name: "Rohit Mehra",
      role: "Local Shop Owner",
      quote: "DukanBook has completely changed how I reward customers. They're coming back more often, and it's super easy to manage.",
      rating: 5,
      image:
        "https://media.istockphoto.com/id/1213534929/photo/male-owner-at-supermarket.jpg?s=612x612&w=0&k=20&c=FaaStzs2PwipPt42Rj-4JF4YRmREKwa9At4c8WTcV8E=",
    },
    {
      name: "Nikita Sharma",
      role: "DukanBook Customer",
      quote: "I didn't even realize how much I was earning until I redeemed my coins for a big discount. It's like free money!",
      rating: 4,
      image: "https://tradersunion.com/uploads/articles/285493/buying-physical-silver-in-india.jpeg",
    },
  ];

 const company = [
    { name: "About us", href: "https://phyr.notion.site/CoinKaro-Loyalty-Program-1fcb713f81d9800794a6d35574584914" },
    { name: "Business guide", href: "https://phyr.notion.site/CoinKaro-for-Business-Owners-1fdb713f81d98079850fd134b15b05f4?pvs=74" },
    // { name: "Press", href: "https://phyr.notion.site/CoinKaro-Loyalty-Program-1fcb713f81d9800794a6d35574584914" },
    // { name: "Blogs", href: "https://phyr.notion.site/CoinKaro-Loyalty-Program-1fcb713f81d9800794a6d35574584914" },
    { name: "Contact us", href: "https://coinkaro.in/contact-us" },
  ];


    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Header */}

<div>
      <div className="flex items-center justify-center bg-neutral-100">
        <div className="bg-white w-full flex justify-center items-center gap-2 py-2 px-10">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.4} d="m14.04 14.863l-.886 3.099c-.332 1.16-1.976 1.16-2.308 0l-.885-3.099a1.2 1.2 0 0 0-.824-.824l-3.099-.885c-1.16-.332-1.16-1.976 0-2.308l3.099-.885a1.2 1.2 0 0 0 .824-.824l.885-3.099c.332-1.16 1.976-1.16 2.308 0l.885 3.099a1.2 1.2 0 0 0 .824.824l3.099.885c1.16.332 1.16 1.976 0 2.308l-3.099.885a1.2 1.2 0 0 0-.824.824m5.531 4.853l-.376 1.508c-.05.202-.337.202-.388 0l-.377-1.508a.2.2 0 0 0-.145-.145l-1.508-.377c-.202-.05-.202-.337 0-.388l1.508-.377a.2.2 0 0 0 .145-.145l.377-1.508c.05-.202.337-.202.388 0l.377 1.508a.2.2 0 0 0 .145.145l1.508.377c.202.05.202.337 0 .388l-1.508.377a.2.2 0 0 0-.145.145m-14.001-14l-.376 1.508c-.05.202-.338.202-.388 0l-.377-1.508a.2.2 0 0 0-.145-.145l-1.508-.377c-.202-.05-.202-.338 0-.388l1.508-.377a.2.2 0 0 0 .145-.145l.377-1.508c.05-.202.338-.202.388 0l.377 1.508a.2.2 0 0 0 .145.145l1.508.377c.202.05.202.338 0 .388l-1.508.377a.2.2 0 0 0-.145.145"></path>
          </svg>
          <p className="text-sm text-neutral-600">
            AI powered invoicing and accounting software <span className="underline">designed for MSME&apos;s</span>.
          </p>
        </div>
      </div>
      <div className="bg-neutral-100 pb-56">
        <div className="flex h-16 items-center justify-between px-20 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 translate-y-0.5" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M2 1.25a.75.75 0 0 0 0 1.5h2v9.527c0 1.34 0 2.01.268 2.601s.772 1.032 1.781 1.915l2 1.75c1.883 1.647 2.824 2.47 3.951 2.47s2.069-.823 3.951-2.47l2-1.75c1.008-.883 1.513-1.324 1.78-1.915c.269-.59.269-1.26.269-2.6V2.75h2a.75.75 0 0 0 0-1.5zm6.5 11a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5zM7.75 8a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7A.75.75 0 0 1 7.75 8" clipRule="evenodd" strokeWidth={0.1} stroke="currentColor"></path>
            </svg>
            <h2 className="text-2xl font-semibold">DukanBook</h2>
          </div>
          <div className="flex items-center">
            <ul className="flex items-center gap-7">
              <li className="cursor-pointer text-neutral-700 hover:text-black">Home</li>
              <li className="cursor-pointer text-neutral-700 hover:text-black flex items-center gap-1">
                <span>Product</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 12h6m6 0h-6m0 0V6m0 6v6"></path>
                </svg>
              </li>
              <li className="cursor-pointer text-neutral-700 hover:text-black flex items-center gap-1">
                <span>Industries</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 12h6m6 0h-6m0 0V6m0 6v6"></path>
                </svg>
              </li>
              <li className="cursor-pointer text-neutral-700 hover:text-black">Pricing</li>
              <li className="cursor-pointer text-neutral-700 hover:text-black flex items-center gap-1">
                <span>Resources</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 12h6m6 0h-6m0 0V6m0 6v6"></path>
                </svg>
              </li>
            </ul>
            <button onClick={() => setIsAuthModalOpen(true)} className="h-10 px-6 ml-6 rounded-xl bg-neutral-800 text-base text-white">
              <span className="font-medium">Sign In</span>
            </button>
          </div>
        </div>
        <div className="mt-16">
          <img src="https://png.pngtree.com/png-vector/20250731/ourlarge/pngtree-abstract-circular-ray-design-png-image_16935306.webp" className="h-32 mx-auto" alt="" />
          <h1 className="text-[80px] mt-8 leading-[1.1] text-center font-eb-garamond">Run Your Business, <br /> Not Your Books.</h1>
          <p className="text-lg font-poppins text-center max-w-4xl leading-[1.8] text-neutral-600 mx-auto mt-6">Send invoices, record transactions, monitor dues, generate statements, and track your business health with AI-driven insights that keep you ahead of delays, errors, and cash crunches.</p>
          <div className="flex items-center justify-center mt-12 gap-3">
            <button className="bg-neutral-900 text-white h-12 text-lg px-8 rounded-xl cursor-pointer">
              Get Started
            </button>
            <button className="bg-white gap-2 text-neutral-900 h-12 text-lg px-8 rounded-xl cursor-pointer flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6" viewBox="0 0 16 16">
                <path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0a6.5 6.5 0 0 0-13 0m4.879-2.773l4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215"></path>
              </svg>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </div>
      <div className="-mt-36">
        <img src="https://i.ibb.co/VcVd19s0/home-p.png"
          className="h-[600px] object-contain mx-auto shadow-2xl rounded-3xl hover:scale-105 transition-all duration-500"
          alt="" />
      </div>

      <div id="features" className="px-6 md:px-16 pt-8 md:pt-16 pb-24 bg-white">
        <h2 className="text-center text-2xl leading-[38px] md:text-3xl font-medium font-poppins md:leading-[44px]">
         Smart Billing for Every Business <br /> Redeem for Savings
        </h2>
        <p className="text-center text-sm md:text-base mt-4 text-neutral-500 leading-7 md:leading-8 max-w-3xl mx-auto">
          Get intelligent suggestions, detect anomalies, view cashflow patterns, and understand your business health instantly.
        </p>
        <div className="max-w-5xl grid grid-cols-1 md:grid-cols-3 mx-auto gap-[40px] lg:gap-[60px] mt-12 md:mt-20">
          <div className="flex flex-col items-center md:items-start">
            <img className="w-full rounded-[20px]" src="/assets/quick-login.png" alt="" />
            <h4 className="text-xl font-medium mt-4">Create Your DukanBook Account</h4>
            <p className="text-sm leading-6 text-neutral-600 mt-2 text-center md:text-left">DukanBook makes billing, accounting, and daily business management effortless. Create invoices instantly, maintain accurate ledgers, and use AI-powered insights to understand your business like never before.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <img className="w-full rounded-[20px]" src="/assets/locate-store.png" alt="" />
            <h4 className="text-xl font-medium mt-4">Start Billing in Seconds</h4>
            <p className="text-sm leading-6 text-neutral-600 mt-2 text-center md:text-left">Create GST and non-GST invoices, share bills via WhatsApp, track payments, manage stock, and record customer details - all from one place.</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <img className="w-full rounded-[20px]" src="/assets/redeem-rewards.png" alt="" />
            <h4 className="text-xl font-medium mt-4">Track Your Business Effortlessly</h4>
            <p className="text-sm leading-6 text-neutral-600 mt-2 text-center md:text-left">Automatically updated ledgers, payment reminders, expense tracking, and AI insights give you complete clarity on your daily business performance.</p>
          </div>
        </div>
        <ul className="w-fit flex justify-center items-center flex-wrap max-w-4xl mx-auto mt-24 gap-4 md:gap-6 text-sm bg-neutral-100 py-6 px-4 rounded-3xl">
          <li className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-lime-500" viewBox="0 0 16 16">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.75 8.75l3.5 3.5l7-7.5"
              ></path>
            </svg>
            <span className="text-sm text-neutral-800">Get rewarded at every purchase</span>
          </li>
          <li className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-lime-500" viewBox="0 0 16 16">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.75 8.75l3.5 3.5l7-7.5"
              ></path>
            </svg>
            <span className="text-sm text-neutral-800">Save money with coins</span>
          </li>
          <li className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-lime-500" viewBox="0 0 16 16">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.75 8.75l3.5 3.5l7-7.5"
              ></path>
            </svg>
            <span className="text-sm text-neutral-800">One portal for all your favorite stores</span>
          </li>
          <li className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-lime-500" viewBox="0 0 16 16">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.75 8.75l3.5 3.5l7-7.5"
              ></path>
            </svg>
            <span className="text-sm text-neutral-800">Hassle-free redemption</span>
          </li>
          <li className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-lime-500" viewBox="0 0 16 16">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.75 8.75l3.5 3.5l7-7.5"
              ></path>
            </svg>
            <span className="text-sm text-neutral-800">0% comission</span>
          </li>
        </ul>
      </div>


      <div id="testimonials" className="px-6 pt-10 md:pt-16 pb-16 md:pb-24 lg:px-[80px] bg-neutral-100">
        <h1 className="text-center text-2xl leading-[38px] md:text-3xl font-medium font-poppins md:leading-[44px]">
          What people say <br /> about DukanBook
        </h1>
        <p className="text-center text-sm md:text-base mt-3 text-neutral-500 leading-6 md:leading-8 max-w-3xl mx-auto">
          Your favorite stores and smart shoppers trust DukanBook
        </p>
        <div className="flex items-center justify-center -space-x-2 mt-6">
          {avatars.map((image, index) => (
            <img
              className="md:h-16 h-14 w-14 md:w-16 border-1 hover:-translate-y-2 grayscale hover:grayscale-0 border-white rounded-full object-cover object-center transition-all"
              src={image}
              key={index}
              alt=""
            />
          ))}
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white z-10 flex items-center justify-center">
            <span className="text-sm md:text-base text-neutral-600 font-semibold">+100</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-5xl mx-auto">
          {testimonials.splice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className={`mx-auto ${index == 1 ? "rotate-0 z-10 bg-white shadow-neutral-200" : "bg-white"
                } p-2 rounded-[30px] border border-neutral-200`}
            >
              <img className="rounded-[22px]" src={testimonial.image} alt="" />
              <div className="p-5">
                <h5 className="font-medium">{testimonial.name}</h5>
                <span className="text-sm text-neutral-500 mt-1">{testimonial.role}</span>
                <p className="mt-2 text-sm leading-6">{testimonial.quote}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-10">
          <button className="bg-neutral-800 text-white text-[15px] border border-neutral-200 rounded-full h-12 w-fit px-6">
            <div className="flex items-center gap-3">
              <span>Share your experience</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-45" width={24} height={24} viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4 12h16m0 0l-6-6m6 6l-6 6"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <div className="pb-2 px-2 bg-white relative">
        <div className="bg-neutral-900 p-6 md:p-[40px] gap-[40px] rounded-t-[20px] rounded-b-[20px] grid grid-cols-1 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 translate-y-0.5" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M2 1.25a.75.75 0 0 0 0 1.5h2v9.527c0 1.34 0 2.01.268 2.601s.772 1.032 1.781 1.915l2 1.75c1.883 1.647 2.824 2.47 3.951 2.47s2.069-.823 3.951-2.47l2-1.75c1.008-.883 1.513-1.324 1.78-1.915c.269-.59.269-1.26.269-2.6V2.75h2a.75.75 0 0 0 0-1.5zm6.5 11a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5zM7.75 8a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7A.75.75 0 0 1 7.75 8" clipRule="evenodd" strokeWidth={0.1} stroke="currentColor"></path>
              </svg>
              <h2 className="text-2xl font-semibold">DukanBook</h2>
            </div>
            <p className="text-neutral-400 text-sm leading-6 mt-4 text-pretty">
              DukanBook is a modern, AI-enabled billing and bookkeeping platform built specifically for small and medium businesses. It simplifies day-to-day financial operations that shop owners struggle with—creating invoices, managing customer dues, tracking expenses, updating ledgers, and staying on top of payments.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 mt-5 shrink-0">
              <a prefetch={true} href="https://business.coinkaro.in/login">
                <div className="text-neutral-200 bg-transparent px-0 w-fit flex items-center gap-2">
                  <div className="flex items-center gap-2">Business login</div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-45 h-6" viewBox="0 0 24 24">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 12h16m0 0l-6-6m6 6l-6 6"
                    ></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-wrap md:justify-end w-full gap-x-[80px] gap-y-[40px] md:gap-[80px]">
            <div>
              <p className="text-neutral-400 font-medium">Company</p>
              <ul className="text-neutral-200 text-sm from-light space-y-3 mt-4">
                {company.map((item, index) => (
                  <li key={index}>
                    <a href={item.href}>{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-neutral-400 font-medium">Product</p>
              <ul className="text-neutral-200 text-sm from-light space-y-3 mt-4">
                <li>
                  <a target="_blank" href="https://www.notion.so/phyr/CoinKaro-Loyalty-Program-1fcb713f81d9800794a6d35574584914?pvs=4#1feb713f81d98062840edc2210aeea03">Merchant capacity</a>
                </li>
                <li>
                  <a target="_blank" href="https://www.notion.so/phyr/CoinKaro-Loyalty-Program-1fcb713f81d9800794a6d35574584914?pvs=4#1feb713f81d9800381dac41bde7dbd27">Consumers capacity</a>
                </li>
                <li>
                  <a target="_blank" href="/testimonials">What people say</a>
                </li>
                <li>
                  <a target="_blank" href="#faq-section">FAQ</a>
                </li>
                <li>
                  <a target="_blank" href="/privacy-policy-home">Privacy Policy</a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-neutral-400 font-medium">Socials</p>
              <ul className="text-neutral-200 text-sm from-light space-y-3 mt-4">
                <li>
                  <a href="https://www.instagram.com/phyr.studios?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==">Instagram</a>
                </li>
              </ul>
            </div>
            <div className="w-full md:max-w-[250px]">
              <div className="flex items-center justify-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-white h-9" viewBox="0 0 20 20">
                  <path
                    fill="currentColor"
                    d="M16 1.1L4 5.9c-1.1.4-2 1.8-2 3v8.7c0 1.2.9 1.8 2 1.4l12-4.8c1.1-.4 2-1.8 2-3V2.5c0-1.2-.9-1.8-2-1.4m.6 2.6l-6 9.3l-6.7-4.5c-.1-.1-.4-.4-.2-.7c.2-.4.7-.2.7-.2l6.3 2.3s4.8-6.3 5.1-6.7c.1-.2.4-.3.7-.1s.2.5.1.6"
                  ></path>
                </svg>
                <label className="text-white font-medium text-base block" htmlFor="">
                  Stay in the loop !
                </label>
              </div>
              <input
                type="email"
                className="border mt-3 outline-none text-white border-neutral-700 px-4 rounded-xl placeholder:text-neutral-600 w-full h-12"
                placeholder="Your email address"
                name=""
                id=""
              />
              <button className="w-full h-12 rounded-xl font-medium text-base bg-white mt-2">Subscribe today</button>
            </div>
          </div>
        </div>
      </div>

    </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export default LandingPage;
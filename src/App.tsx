import { useState, useEffect, useRef, FormEvent } from 'react'
import OpenAI from 'openai';
import Sphere from "./assets/sphere.png";
import Fireflies from "./assets/fireflies.gif"

function App() {
  const [placeholder,setPlaceHolder] = useState("");
  const [prompt,setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
 
  const phrases = [
    "A pineapple in the ocean",
    "Astronaut on the moon with a beer",
    "A dog walking a cat",
    "Supperman on the train"
  ]

  const typingSpeed = 100
  const deletingSpeed = 50 
  const delayBeforeTyping = 1000 

  const typingTimeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(()=>{
    let currentIndex = 0
    let currentText = ""
    let isDeleting = false

    function type(){
      const currentPhrase = phrases[currentIndex]

      if (isDeleting){
        currentText = currentPhrase.substring(0,currentText.length - 1)
      }else{
        currentText = currentPhrase.substring(0,currentText.length + 1)
      }

      setPlaceHolder(currentText);

      if (!isDeleting && currentText === currentPhrase){
        isDeleting = true
        typingTimeRef.current = setTimeout(type, delayBeforeTyping)
      }else if(isDeleting && currentText === ""){
        isDeleting = false
        currentIndex = (currentIndex + 1) % phrases.length
        typingTimeRef.current = setTimeout(type, typingSpeed)
      }else{
        typingTimeRef.current = setTimeout(type,isDeleting ? deletingSpeed : typingSpeed)
      }
    }

    typingTimeRef.current = setTimeout(type, delayBeforeTyping);

    return () =>{
      const timer = typingTimeRef.current;
      if(timer != null){
        clearTimeout(timer)
      }
    }
  },[]);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_REACT_APP_OPENAI_API_KEY, // This is also the default, can be omitted
    dangerouslyAllowBrowser: true
  });

  const handleChange = (e: FormEvent)=> {
    const target = e.target as HTMLInputElement;
    setPrompt(target.value);
  }

  const generateImage = async (e: FormEvent) =>{
    e.preventDefault()
    setLoading(true)
    try {
      const res = await openai.images.generate({
        prompt: prompt,
        n:1,
        size:"512x512",
      })
      setLoading(false)
      setResult(res.data[0].url!)
    } catch (error) {
      setLoading(false)
      if (typeof error === "string"){
      console.error("Error Generating Image")
      }else if (error instanceof Error){
        console.error(`Error Generating Image : ${error.message}`)
      }else{
        console.error("Unknown error")
      }
    }
  }


  return ( 
  
    <div className="w-screen h-screen bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-sky-400 to-indigo-900 relative overflow-hidden">
       <div>
         <img src={Fireflies} alt="fireflies" className='z-0 absolute w-full h-full' />
         <img src={Sphere} alt="sphere" className='w-[600px] absolute lg:top-0 lg:right-4 animate-pulse hidden lg:block drop-shadow-2xl' />
         <img src={Sphere} alt="sphere" className='w-[350px] absolute lg:bottom-10 animate-pulse hidden lg:block drop-shadow-2xl' />
         <img src={Sphere} alt="sphere" className='w-[400px] absolute lg:bottom-[100px] lg:right-[5px] animate-pulse hidden lg:block drop-shadow-2xl' />
         <img src={Sphere} alt="sphere" className='w-[500px] absolute lg:top-[150px] lg:left-30 animate-pulse hidden lg:block drop-shadow-2xl' />
         <img src={Sphere} alt="sphere" className='w-[350px] absolute lg:top-20 lg:left-1 animate-pulse hidden lg:block drop-shadow-2xl ' />
       </div>
       <div className='flex justify-center align-middle
        items-center flex-col p-10 text-center z-10 relative mt-12'>
           <h6 className="text-2xl text-white semi-bold mb-4">Welcome to </h6>
       <h1 className="text-5xl font-bold
     bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300
     text-transparent bg-clip-text uppercase mb-3 animate-pulse">Render-AI</h1>
    <span className="text-white semi-bold">Create Images using Artificial Intelligence</span>
     

   <form className="mt-10 flex">
      <input value={prompt} onChange={handleChange} type="text" placeholder={placeholder} className="w-80 rounded-md px-2" />
      <button className="" onClick={generateImage}>
        <span className="bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300
     text-transparent bg-clip-text uppercase mx-4 py-1 px-3 text-xl cursor-pointer bold">Create ✨</span>
      </button>
    </form>
       </div>    
     
    {loading ? (
        <div className=" text-center items-center text-5xl font-bold uppercase bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300 text-transparent bg-clip-text mt-10">
          Loading...
        </div>
      ) : (
        <></>
      )}

      {result.length > 0 ? 
      
 
        <div className='text-center items-center flex justify-center mb-4'>
        <img className="mt-10 mb-8 rounded-md relative" src={result} alt="Generated Image" />
        </div>
   
      : <></>}
   
    </div>
  )
}

export default App
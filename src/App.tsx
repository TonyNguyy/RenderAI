import { useState, useEffect, useRef, FormEvent} from "react"
import OpenAI from "openai";




const App = () => {
  const [placeholder,setPlaceHolder]= useState("");
  const [prompt, setPrompt]= useState('')
  const [result,setResult] = useState('')
  const [loading,setLoading] = useState(false)

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


  const generateImage = async (e: FormEvent) =>{
    e.preventDefault()
    setLoading(true)
    try {
      const res = await openai.images.generate({
        prompt: "A house on mars",
        n:1,
        size:"512x512",
      })
      setLoading(false)
      setResult(res.data[0].url!)
      console.log(result)
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
    <div className="w-screem h-screen bg-black flex justify-center
    items-center flex-col p-5 text-center">
     <h1 className="text-5xl font-bold
     bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300
     text-transparent bg-clip-text uppercase">AI Image Generator</h1>
    <span className="text-white semi-bold">Create Images using Artificial Intelligence</span>
    

    <form className="mt-10 flex">
      <input type="text" placeholder={placeholder} className="w-80 rounded-md px-1" />
      <button className="" onClick={generateImage}>
        <span className="bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300
     text-transparent bg-clip-text uppercase mx-4 py-1 px-3 text-xl cursor-pointer bold">Create ✨</span>
      </button>
    </form>
    {loading ? (
        <div className=" text-5xl font-bold uppercase bg-gradient-to-r from-pink-500 via-yellow-300 to-green-300 text-transparent bg-clip-text mt-10">
          Loading...
        </div>
      ) : (
        <></>
      )}

      {result.length > 0 ? <img className="mt-10" src={result} alt="Generated Image" /> : <></>}


    </div>
  )
}

export default App

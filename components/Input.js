import { CalendarIcon, ChartBarIcon, EmojiHappyIcon, PhotographIcon, XIcon, } from "@heroicons/react/outline";
import { addDoc, collection, doc, serverTimestamp, updateDoc, } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef } from "react";
import { db, storage } from "../firebase";


import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';



export default function Input() {
  const { data: session } = useSession();

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const filePickerRef = useRef(null);

  const [showEmojis, setShowEmojis] = useState(false);

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    const docRef = await addDoc(collection(db, "posts"), {
      // id: session.user.uid,
      text: input,
      // userImg: session.user.image,
      timestamp: serverTimestamp(),
      //name: session.user.name,
      //username: session.user.username,
    });

    const imageRef = ref(storage, `posts/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), {
          image: downloadURL,
        });
      });
    }

    setInput("");
    setSelectedFile(null);
    setLoading(false);

    setShowEmojis(false);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };


  const addEmoji = (e) => {
    let sym = e.unified.split("-");
    let codesArray = [];
    sym.forEach((el) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };


  return (
    <>
      {session && (
        <div className="flex  border-b border-gray-200 p-3 space-x-3">
          <img
            onClick={signOut}
            src={session.user.image}
            alt="user-img"
            className="h-11 w-11 rounded-full cursor-pointer hover:brightness-95"
          />
          <div className="w-full divide-y divide-gray-200">
            <div className={`${selectedFile && "pb-7"} ${input && "space-y-2.5"}`}>

              <textarea
                className="w-full border-none focus:ring-0 text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700"
                rows="2"
                placeholder="What's happening?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              ></textarea>


              {selectedFile && (
                <div className="relative">
                  <XIcon
                    onClick={() => setSelectedFile(null)}
                    className="h-7 text-black absolute cursor-pointer shadow-md shadow-white rounded-full"
                  />
                  <img
                    src={selectedFile}
                    className={`${loading && "animate-pulse"}`}
                  />
                </div>

              )}
            </div>
            {!loading && (

              <div className="flex items-center justify-between pt-2.5">

                <div className="flex items-center">
                  <div
                    className=""
                    onClick={() => filePickerRef.current.click()}
                  >
                    <PhotographIcon className="h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100" />
                    <input
                      type="file"
                      hidden
                      ref={filePickerRef}
                      onChange={addImageToPost}
                    />
                  </div>
                  <div className="icon rotate-90">
                    <ChartBarIcon className="h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100" />
                  </div>

                  <div className="icon" onClick={() => setShowEmojis(!showEmojis)}>
                    <EmojiHappyIcon className="h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100" />

                    {showEmojis && (
                      <Picker
                        onEmojiSelect={addEmoji}
                        style={{
                          position: "absolute",
                          marginTop: "465px",
                          marginLeft: -40,
                          maxWidth: "320px",
                          borderRadius: "20px",
                        }}
                        theme="dark"
                      />
                    )}
                  </div>

                  <div className="icon">
                    <CalendarIcon className="h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100" />
                  </div>

                </div>
                <button
                  onClick={sendPost}
                  disabled={!input && !selectedFile}
                  className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                >
                  Tweet
                </button>

              </div>

            )}

          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { collection, getDocs, where, query } from "firebase/firestore";

export default function Library() {
  const [extractedWords, setExtractedWords] = useState([]);
  const [userImage, setUserImage] = useState(""); // 사용자 이미지 상태 추가
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchExtractedWords = async () => {
      // 세션 로딩 중이거나 세션이 없는 경우 데이터를 가져오지 않도록 처리합니다.
      if (status === "loading" || !session?.user?.name) return;

      try {
        // Firestore 쿼리 설정
        const extractedWordsRef = collection(db, "extractedWords");
        const q = query(
          extractedWordsRef,
          where("username", "==", session.user.name)
        );
        const querySnapshot = await getDocs(q);

        const words = [];
        querySnapshot.forEach((doc) => {
          words.push({ id: doc.id, ...doc.data() });
        });
        setExtractedWords(words);
      } catch (error) {
        console.error("Error fetching extracted words: ", error);
      }
    };

    fetchExtractedWords();
  }, [session, status]); // 세션 및 상태 변경 시에만 useEffect가 호출되도록 합니다.

  useEffect(() => {
    if (session) {
      // 카카오 프로필 이미지 설정
      if (session.user.image) {
        setUserImage(session.user.image);
      }
    }
  }, [session]);

  // 세션 로딩 중일 때는 로딩 스피너를 표시하거나 아무 것도 렌더링하지 않습니다.
  if (status === "loading") return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 h-[50px] sm:h-[60px] py-2 px-2 sm:px-8 bg-black flex items-center justify-between">
        <div className="flex text-center items-end">
          <Link
            href="/"
            className="text-red-500 font-bold text-3xl hover:opacity-50"
          >
            CHATFLIX
          </Link>
          <Link
            href="/library"
            className="ml-6 text-neutral-200 font-bold text-lg hover:opacity-50"
          >
            Library
          </Link>
        </div>
        <div className="flex items-center ml-auto">
          {userImage && (
            <img
              src={userImage}
              alt="User profile"
              className="w-8 h-8 rounded-full mr-2" // 적절한 크기로 설정
            />
          )}
          <Link
            href="/login"
            className={`w-28
                    p-1 
                    text-neutral-300
                    border border-neutral-300 rounded
                    hover:bg-neutral-800
                    ml-auto
                    text-center
                    flex items-center justify-center`}
          >
            마이 페이지
          </Link>
        </div>
        {/* <RealtimeSearch /> */}
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">라이브러리</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {extractedWords.map((item, index) => (
            <div key={index} className="p-4 rounded-lg shadow bg-neutral-800">
              <h2 className="text-lg text-neutral-300">{item.word}</h2>
              <div>
                {item.conversationId.map((conversationId) => (
                  <Link
                    key={conversationId}
                    href={`/?conversationID=${conversationId}`}
                    className="text-red-500 hover:underline block"
                  >
                    언급된 대화
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

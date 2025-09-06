'use client'

import React, { useState, useEffect, FormEvent } from 'react'

export default function Home() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [img, setImg] = useState<string | null>(null)
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            setIsLiked(true);
        }
    };

    const loadFavorites = () => {
        setImg(localStorage.getItem("image"));
    }

    useEffect(() => {
        localStorage.setItem('image', JSON.stringify(img));
    }, [img]);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const server = 'http://localhost:4000'

            const formData = new FormData(event.currentTarget)
            const response = await fetch(`${server}/api/images/generate`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to submit the data. Please try again.')
            }

            const data = await response.json()
            setImg(data.image)
        } catch (error) {
            // @ts-ignore
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <input type="text" placeholder={"Make an image request"} required={true} name="prompt" />
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Submit'}
            </button>
        </form>
          {img && (
              <div>
                  <img src={img} alt="" />
                  <button onClick={handleLike}>
                      {isLiked ? '❤️ Liked' : '🤍 Like'}
                  </button>
                  <div>
                      <label>Favorites images</label>
                      <button onClick={loadFavorites}>
                          <img src={img} alt="image" />
                      </button>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
}

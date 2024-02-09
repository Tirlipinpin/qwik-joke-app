import { $, component$, useSignal, useStylesScoped$, useTask$ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, server$ } from '@builder.io/qwik-city';
import styles from "./index.css?inline";

export const useJokeVoteAction = routeAction$(async (props) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 2000)
  })

  await promise

  console.log('VOTE', props);
  return { status: 200 }
});

export const useDadJoke = routeLoader$(async () => {
  const response = await fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' },
  });
  return (await response.json()) as {
    id: string;
    status: number;
    joke: string;
  };
});
 
export default component$(() => {
  // Calling our `useDadJoke` hook, will return a reactive signal to the loaded data.
  const dadJokeSignal = useDadJoke();
  const favoriteJokeAction = useJokeVoteAction();

  useStylesScoped$(styles);

  const isFavoriteSignal = useSignal<boolean>(false)

  const onFavoriteClick = $(() => {
    isFavoriteSignal.value = !isFavoriteSignal.value
  })

  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log('FAVORITE (isomorphic)', isFavoriteSignal.value);
    server$(() => {
      console.log('FAVORITE (server)', isFavoriteSignal.value);
    })();
  });

  return (
    <section class="section bright">
      <p>{dadJokeSignal.value.joke}</p>
      <Form action={favoriteJokeAction}>
        <input type="hidden" name="jokeID" value={dadJokeSignal.value.id} />
        <button name="vote" value="up">👍</button>
        <button name="vote" value="down">👎</button>
      </Form>
      <button onClick$={onFavoriteClick}>{isFavoriteSignal.value ? '♥' : '♡'}</button>
    </section>
  );
});

import { Redirect, useLocalSearchParams } from 'expo-router';

export default function PublicEventInviteRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();

  return (
    <Redirect
      href={{
        pathname: '/public-rsvp/[slug]',
        params: { slug: slug || '' },
      }}
    />
  );
}

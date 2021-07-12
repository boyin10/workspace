import { BeneficiaryApplication } from '@popcorn/utils';
import * as Icon from 'react-feather';

function getSocialMediaIcon(platform: string): JSX.Element {
  switch (platform) {
    case 'twitter':
      return <Icon.Twitter aria-hidden="true" />;
    case 'facebook':
      return <Icon.Facebook aria-hidden="true" />;
    case 'instagram':
      return <Icon.Instagram aria-hidden="true" />;
    case 'github':
      return <Icon.GitHub aria-hidden="true" />;
    case 'linkedin':
      return <Icon.Linkedin aria-hidden="true" />;
    case 'website':
      return <Icon.Globe aria-hidden="true" />;
    case 'email':
      return <Icon.Mail aria-hidden="true" />;
  }
}

const SocialMediaIcon = ({
  url,
  platform,
}: {
  url: string;
  platform: string;
}): JSX.Element => {
  return (
    url !== '' && (
      <a
        href={`${platform === 'email' ? 'mailto:' : 'https://'}${url}`}
        target="_blank"
        className="text-gray-400 hover:text-gray-500"
      >
        {getSocialMediaIcon(platform)}
      </a>
    )
  );
};

export default function SocialMedia(
  beneficiary: BeneficiaryApplication,
): JSX.Element {
  return (
    <>
      <div className="flex space-x-6">
        <SocialMediaIcon
          url={beneficiary?.links?.website}
          platform={'website'}
        />
        <SocialMediaIcon
          url={beneficiary?.links.contactEmail}
          platform={'email'}
        />
        <SocialMediaIcon
          url={beneficiary?.links?.twitterUrl}
          platform={'twitter'}
        />
        <SocialMediaIcon
          url={beneficiary?.links?.facebookUrl}
          platform={'facebook'}
        />
        <SocialMediaIcon
          url={beneficiary?.links?.instagramUrl}
          platform={'instagram'}
        />
        <SocialMediaIcon
          url={beneficiary?.links?.githubUrl}
          platform={'github'}
        />
        <SocialMediaIcon
          url={beneficiary?.links?.linkedinUrl}
          platform={'linkedin'}
        />
      </div>
    </>
  );
}

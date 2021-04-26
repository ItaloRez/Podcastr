import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../Utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string,
    title: string,
    thumbnail: string,
    members: string,
    publishedAt: string,
    duration: number,
    durationAsString: string,
    description: string,
    url: string,
};

type EpisodeProps = {
    episode: Episode;
};

export default function Episode({episode}: EpisodeProps){

    const {play} = usePlayer();


    return(
        <div className={styles.tela}>
            <Head>
                <title>{episode.title}</title>
            </Head>
            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href='/'>    
                        <button type='button'>
                            <img src="/arrow-left.svg" alt="Voltar"/>
                        </button>
                    </Link>
                    <Image 
                        width={700}
                        height={250}
                        src={episode.thumbnail}
                        objectFit='cover'
                    />
                    <button type='button'>
                        <img src="/play.svg" onClick={() => play(episode)} alt="Tocar episódio"/>
                    </button>
                </div>

                <header>
                    <h1>{episode.title}</h1>
                    <span>{episode.members}</span>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                </header>

                <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description}} /> 
            </div>
        </div>
    )
}


export const getStaticPaths: GetStaticPaths = async () => {


    const { data } = await api.get('episodes',{
        params:{
          _limit: 2,
          _sort: 'published_at',
          _order: 'desc'
        }
    })

    const paths = data.map(episode =>{
        return{
            params:{
                slug: episode.id
            }
        }
    })


    return{

        paths,//Colocar apenas as páginas mais acessadas
        fallback: 'blocking'//increment static regeneration, gera novas páginas SSG conforme são acessadas
    }

}

export const getStaticProps: GetStaticProps = async (ctx) => {
    
    const {slug} = ctx.params;
    const {data} = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
  
      }

    return{
        props:{
            episode,
        },
        revalidate: 60 * 60 * 24, //24 hours
    }
}
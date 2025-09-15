const fs = require('fs-extra');
const axios = require('axios');
const zlib = require('zlib');
const xml2js = require('xml2js');

// Whitelisted channels
const channels = [
  "Comet(COMET).us",
  "Laff(LAFF).us",
  "ABC(WMTW).us",
  "FOX(WFXT).us",
  "FOX(WPFO).us",
  "NBC(WBTSCD).us",
  "NBC(WCSH).us",
  "ABC(WCVB).us",
  "ABC(WMTW).us",
  "NewEnglandCableNews(NECN).us",
  "PBS(HD01).us",
  "CW(WLVI).us",
  "CBS(WBZ).us",
  "WSBK.us",
  "CBS(WGME).us",
  "ION.us",
  "MeTVNetwork(METVN).us",
  "INSPHD(INSPHD).us",
  "GameShowNetwork(GSN).us",
  "FamilyEntertainmentTelevision(FETV).us",
  "Heroes&IconsNetwork(HEROICN).us",
  "TurnerClassicMoviesHD(TCMHD).us",
  "OprahWinfreyNetwork(OWN).us",
  "BET.us",
  "DiscoveryChannel(DSC).us",
  "Freeform(FREEFRM).us",
  "USANetwork(USA).us",
  "NewEnglandSportsNetwork(NESN).us",
  "NewEnglandSportsNetworkPlus(NESNPL).us",
  "NBCSportsBoston(NBCSB).us",
  "ESPN.us",
  "ESPN2.us",
  "ESPNEWS.us",
  "AWealthofEntertainmentHD(AWEHD).us",
  "WEtv(WE).us",
  "OxygenTrueCrime(OXYGEN).us",
  "DisneyChannel(DISN).us",
  "DisneyJunior(DJCH).us",
  "DisneyXD(DXD).us",
  "CartoonNetwork(TOONLSH).us",
  "Nickelodeon(NIK).us",
  "MSNBC.us",
  "CableNewsNetwork(CNN).us",
  "HLN.us",
  "CNBC.us",
  "FoxNewsChannel(FNC).us",
  "LifetimeRealWomen(LRW).us",
  "TNT.us",
  "Lifetime(LIFE).us",
  "LMN.us",
  "TLC.us",
  "AMC.us",
  "Home&GardenTelevisionHD(HGTVD).us",
  "TheTravelChannel(TRAV).us",
  "A&E(AETV).us",
  "FoodNetwork(FOOD).us",
  "Bravo(BRAVO).us",
  "truTV(TRUTV).us",
  "NationalGeographicHD(NGCHD).us",
  "HallmarkChannel(HALL).us",
  "HallmarkFamily(HFM).us",
  "HallmarkMystery(HMYS).us",
  "SYFY.us",
  "AnimalPlanet(APL).us",
  "History(HISTORY).us",
  "TheWeatherChannel(WEATH).us",
  "ParamountNetwork(PAR).us",
  "ComedyCentral(COMEDY).us",
  "FXM.us",
  "FXX.us",
  "FX.us",
  "E!EntertainmentTelevisionHD(EHD).us",
  "AXSTV(AXSTV).us",
  "TVLand(TVLAND).us",
  "TBS.us",
  "VH1.us",
  "MTV-MusicTelevision(MTV).us",
  "CMT(CMTV).us",
  "DestinationAmerica(DEST).us",
  "MagnoliaNetwork(MAGN).us",
  "MagnoliaNetworkHD(Pacific)(MAGNPHD).us",
  "DiscoveryLifeChannel(DLC).us",
  "NationalGeographicWild(NGWILD).us",
  "SmithsonianChannelHD(SMTSN).us",
  "BBCAmerica(BBCA).us",
  "POP(POPSD).us",
  "Crime&InvestigationNetworkHD(CINHD).us",
  "Vice(VICE).us",
  "InvestigationDiscoveryHD(IDHD).us",
  "ReelzChannel(REELZ).us",
  "DiscoveryFamilyChannel(DFC).us",
  "Science(SCIENCE).us",
  "AmericanHeroesChannel(AHC).us",
  "AMC+(AMCPLUS).us",
  "Fuse(FUSE).us",
  "MusicTelevisionHD(MTV2HD).us",
  "IFC.us",
  "FYI(FYISD).us",
  "CookingChannel(COOK).us",
  "Logo(LOGO).us",
  "AdultSwim(ADSM).ca",
  "ANTENNA(KGBTDT).us",
  "CHARGE!(CHARGE).us",
  "FS1.us",
  "FS2.us",
  "NFLNetwork(NFLNET).us",
  "NHLNetwork(NHLNET).us",
  "MLBNetwork(MLBN).us",
  "NBATV(NBATV).us",
  "CBSSportsNetwork(CBSSN).us",
  "Ovation(OVATION).us",
  "UPTV.us",
  "COZITV(COZITV).us",
  "OutdoorChannel(OUTD).us",
  "ASPiRE(ASPRE).us",
  "HBO.us",
  "HBO2(HBOHIT).us",
  "HBOComedy(HBOC).us",
  "HBOSignature(HBODRAM).us",
  "HBOWest(HBOHDP).us",
  "HBOZone(HBOMOV).us",
  "CinemaxHD(MAXHD).us",
  "MoreMAX(MAXHIT).us",
  "ActionMAX(MAXACT).us",
  "5StarMAX(MAXCLAS).us",
  "Paramount+withShowtimeOnDemand(SHOWDM).us",
  "ShowtimeExtreme(SHOWX).us",
  "ShowtimeNext(NEXT).us",
  "ShowtimeShowcase(SHOCSE).us",
  "ShowtimeFamilyzone(FAMZ).us",
  "ShowtimeWomen(WOMEN).us",
  "Starz(STARZ).us",
  "StarzEdge(STZE).us",
  "StarzCinema(STZCI).us",
  "StarzComedy(STZC).us",
  "StarzEncore(STZENC).us",
  "StarzEncoreBlack(STZENBK).us",
  "StarzEncoreClassic(STZENCL).us",
  "StarzEncoreFamily(STZENFM).us",
  "StarzEncoreWesterns(STZENWS).us",
  "StarzKids(STZK).us",
  "StarzEncoreAction(STZENAC).us",
  "ScreenPix(SCRNPIX).us",
  "ScreenPixAction(SCRNACT).us",
  "ScreenPixVoices(SCRNVOI).us",
  "ScreenPixWesterns(SCRNWST).us",
  "MoviePlex(MPLEX).us",
  "MGM+Drive-In(MGMDRV).us",
  "MGM+HD(MGMHD).us",
  "MGM+Hits(MGMHIT).us",
  "SonyMovieChannel(SONY).us",
  "TheMovieChannel(TMC).us"

  // add the rest of your whitelisted channels here
];

async function fetchEPG() {
  try {
    console.log('Fetching 7-day EPG...');

    const url = 'https://epg.jesmann.com/iptv/UnitedStates-7day.xml.gz';
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const xmlBuffer = zlib.gunzipSync(response.data);
    const xmlString = xmlBuffer.toString('utf-8');

    const parsed = await xml2js.parseStringPromise(xmlString);

    // Filter channels
    parsed.tv.channel = parsed.tv.channel.filter(ch => channels.includes(ch.$.id));
    parsed.tv.programme = parsed.tv.programme.filter(pr => channels.includes(pr.$.channel));

    const builder = new xml2js.Builder();
    const finalXml = builder.buildObject(parsed);

    fs.writeFileSync('epg_7day.xml', finalXml, 'utf-8');
    console.log('7-day EPG saved as epg_7day.xml');
  } catch (err) {
    console.error('Error fetching 7-day EPG:', err.message);
    process.exit(1);
  }
}

fetchEPG();

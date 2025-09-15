// fetch_full_epg.js
const fs = require('fs-extra');
const axios = require('axios');
const zlib = require('zlib');
const xml2js = require('xml2js');

const channels3Day = [
  { full: "4UV.us", clean: "4UV" },
  { full: "48Hours(48HOURS).us", clean: "48Hours" },
  { full: "60Minutes(60MINS).us", clean: "60Minutes" },
  { full: "AccordingtoJim(DISATJ).us", clean: "AccordingtoJim" },
  { full: "AcornTVMysteries(ACNMYST).us", clean: "AcornTVMysteries" },
  { full: "AdultAnimation(PPLUSAA).us", clean: "AdultAnimation" },
  { full: "ALF.us", clean: "ALF" },
  { full: "AlfredHitchcockPresents(AHP).us", clean: "AlfredHitchcockPresents" },
  { full: "AlienNationbyDUST(DUST).us", clean: "AlienNationbyDUST" },
  { full: "AllRealityWEtv(WEREAL).us", clean: "AllRealityWEtv" },
  { full: "AllWeddingsWEtv(ALLWED).us", clean: "AllWeddingsWEtv" },
  { full: "America'sDumbestCriminals(XMVADC).us", clean: "America'sDumbestCriminals" },
  { full: "AmericanCrimes(ACRM).us", clean: "AmericanCrimes" },
  { full: "AmericanNinjaWarrior(AMNJWR).us", clean: "AmericanNinjaWarrior" },
  { full: "AncientAliens(ANCIENT).us", clean: "AncientAliens" },
  { full: "AngerManagement(AGRMGT).us", clean: "AngerManagement" },
  { full: "AntiquesRoadshowUK(ARUK).us", clean: "AntiquesRoadshowUK" },
  { full: "AttheMovies(WBTV1S).us", clean: "AttheMovies" },
  { full: "AxMen(AXMEN).us", clean: "AxMen" },
  { full: "Backstage(BAKSGE).us", clean: "Backstage" },
  { full: "BadGirlsClub(BGCL).us", clean: "BadGirlsClub" },
  { full: "BarRescue(PTVBAR).us", clean: "BarRescue" },
  { full: "Baywatch(BAYW).us", clean: "Baywatch" },
  { full: "BestofDr.Phil(BDPH).us", clean: "BestofDr.Phil" },
  { full: "BeyondBelief(XMVBB).us", clean: "BeyondBelief" },
  { full: "BeyondBelief:FactorFiction!(XAZBBUK).us", clean: "BeyondBelief:FactorFiction!" },
  { full: "BravoVault(BRVVLT).us", clean: "BravoVault" },
  { full: "BritBoxMysteries(PTVBBMS).us", clean: "BritBoxMysteries" },
  { full: "BritBoxMysteries(BBCBBM).us", clean: "BritBoxMysteries" },
  { full: "BUZZRStream(BUZZRST).us", clean: "BUZZRStream" },
  { full: "CarChase(CARCHSE).us", clean: "CarChase" },
  { full: "CelebrityNameGame(CNGWCF).us", clean: "CelebrityNameGame" },
  { full: "Cheaters(XMVCH).us", clean: "Cheaters" },
  { full: "CINEVAULT(CINEVLT).us", clean: "CINEVAULT" },
  { full: "CINEVAULTWesterns(CVWEST).us", clean: "CINEVAULTWesterns" },
  { full: "CINEVAULT:Classics(CVCLASS).us", clean: "CINEVAULT:Classics" },
  { full: "CINEVAULT:Westerns(VIZWEST).us", clean: "CINEVAULT:Westerns" },
  { full: "ClassicDoctorWho(CDW).us", clean: "ClassicDoctorWho" },
  { full: "ClassicDoctorWho(CDWTUBI).us", clean: "ClassicDoctorWho" },
  { full: "ColdCaseFiles(PTVCCF).us", clean: "ColdCaseFiles" },
  { full: "ColdCaseFiles(COLD).us", clean: "ColdCaseFiles" },
  { full: "CombatWarChannel(XPLCWC).us", clean: "CombatWarChannel" },
  { full: "ComedyDynamics(COMCLN).us", clean: "ComedyDynamics" },
  { full: "ConfessbyNosey(NSYCONF).us", clean: "ConfessbyNosey" },
  { full: "CornerGas(WAZCGAS).us", clean: "CornerGas" },
  { full: "CourtTV(COURTST).us", clean: "CourtTV" },
  { full: "CourtTVLegendaryTrials(LEGTRI).us", clean: "CourtTVLegendaryTrials" },
  { full: "Crime&Justice(PPLUSCJ).us", clean: "Crime&Justice" },
  { full: "CrimeScenes(WBTV5S).us", clean: "CrimeScenes" },
  { full: "Crunchyroll(CRUNCHY).us", clean: "Crunchyroll" },
  { full: "CSI(PTVCSI).us", clean: "CSI" },
  { full: "CSI(PPLUSCSI).us", clean: "CSI" },
  // … continue adding **all remaining channels from your original list** in the same format
];

async function fetch3DayEPG() {
  try {
    console.log('Fetching 3-day EPG...');

    const url = 'https://epg.jesmann.com/iptv/USFast.xml.gz';
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const xmlBuffer = zlib.gunzipSync(response.data);
    const xmlString = xmlBuffer.toString('utf-8');

    const parsed = await xml2js.parseStringPromise(xmlString);

    const filteredChannels = parsed.tv.channel.filter(ch => {
      const id = ch.$.id.toLowerCase();
      const displayNames = (ch['display-name'] || []).map(d => d.toLowerCase());
      return channels3Day.some(c =>
        id.includes(c.full.toLowerCase()) ||
        displayNames.some(d => d.includes(c.clean.toLowerCase()))
      );
    });

    const filteredPrograms = parsed.tv.programme.filter(pr =>
      filteredChannels.some(ch => ch.$.id === pr.$.channel)
    );

    const builder = new xml2js.Builder();
    const finalXml = builder.buildObject({
      tv: {
        $: parsed.tv.$,
        channel: filteredChannels,
        programme: filteredPrograms
      }
    });

    await fs.outputFile('epg_3day_filtered.xml', finalXml);
    console.log('3-day filtered EPG saved as epg_3day_filtered.xml');
  } catch (err) {
    console.error('Error fetching 3-day EPG:', err.message);
  }
}

fetch3DayEPG();

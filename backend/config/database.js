const { Client } = require("pg")
const bcrypt = require('bcryptjs');

const client = new Client({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "jkpg-db",
    port: process.env.DB_PORT || 5432,
});

async function connectDB() {
    try{
        await client.connect();
        console.log("Connected to PostgreSQL database");
        
        // Create tables in correct order
        await createVenuesTable();
        await createUsersTable(); // ADDED THIS!

        await createAdminUser();
        
        // Add sample data
        await addSampleVenues();
        
    } catch (err) {
        console.error('Connection error', err.stack);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
}

// Renamed for clarity
async function createVenuesTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS venues (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            url VARCHAR(500),
            district VARCHAR(100),
            category VARCHAR(100),
            phone VARCHAR(50),
            description TEXT
        );
    `;
    
    try {
        await client.query(createTableQuery);
        console.log('Table "venues" created or already exists');
    } catch (err) {
        console.error('Error creating venues table', err.stack);
        throw err; // Re-throw to handle in connectDB
    }
}

// NEW FUNCTION - Creates users table for authentication
async function createUsersTable() {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await client.query(createUsersTableQuery);
        console.log('Table "users" created or already exists');
    } catch (err) {
        console.error('Error creating users table', err.stack);
        throw err;
    }
}

// Create admin user (FIXED - no duplicate connection)
async function createAdminUser() {
    try {
        const checkAdmin = await client.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (checkAdmin.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await client.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
                ['admin', hashedPassword, 'admin']
            );

            console.log('Admin user created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

async function addSampleVenues() {
     // Check if table is empty first
    const checkQuery = 'SELECT COUNT(*) FROM venues';
    const result = await client.query(checkQuery);
    
    if (parseInt(result.rows[0].count) === 0) {
        // Insert all venues from stores.json
        const query = `INSERT INTO venues (name, url, district) VALUES
        ('Åhlens', 'ahlens.se/varuhus/jonkoping?utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=website_link', 'Öster'),
        ('Akademibokhandeln', 'akademibokhandeln.se/butik/jonkoping-c', 'Öster'),
        ('Apoteket AB', 'apoteket.se/apotek/apoteket-ostra-storgatan-jonkoping/', NULL),
        ('Apotek Hjärtat', 'apotekhjartat.se/hitta-apotek-hjartat/jonkoping/apotek_hjartat_smedjegatan_2_jonkoping/', NULL),
        ('Ashur Brud & Fest - Skrädderi', 'facebook.com/AshuraitaBrudFest/', NULL),
        ('Asia livs, servicebutik', 'facebook.com/profile.php?id=100051215441977', NULL),
        ('Ateljé Creativ i Jönköping/Finrummet', '/finrummet.net', 'Väster'),
        ('Ateljé KEG', 'ateljekeg.se', 'Öster'),
        ('Atlantis Dive College', 'atlantis.se', 'Väster'),
        ('Bagelle väskboutique', NULL, NULL),
        ('Balance Ljud och Bild', 'balance.se', NULL),
        ('BGA Fotocenter', 'bgafotocenter.se/jonkoping/', 'Öster'),
        ('Bikupan', 'bikupan.org', 'Tändsticksområdet'),
        ('Blankdays', 'https://blankdays.com/collections/all-products?gclid=CjwKCAjwov6hBhBsEiwAvrvN6EZZ1PsnlSJhnE7bmxINtl0Y0noU3rvCybdt217CGd3-bqMdx3mYRxoCK5EQAvD_BwE', 'Tändsticksområdet'),
        ('Boardlife', 'boardlife.se', 'Väster'),
        ('Borgs skor', 'borgsskor.se/kontakt', 'Öster'),
        ('Boutique Lykka', 'boutiquelykka.se', 'Öster'),
        ('Broder Bläck', 'facebook.com/broderblacktatuering/', 'Öster'),
        ('Buketten', 'instagram.com/bukettenjonkoping/?hl=sv', 'Öster'),
        ('Busfrö Nytt & Bytt', 'busfro.se', 'Öster'),
        ('Butiken Noga Utvalt', 'butikenjkpg.se', 'Atollen'),
        ('Carlings', 'carlings.com/sv/corporate/Butiker/sweden/58f/', 'Öster'),
        ('Casa Souk', 'casasouk.se', 'Väster'),
        ('Cervera', 'cervera.se/hitta-butik/', 'Öster'),
        ('Clas Ohlson', 'clasohlson.com/se/store-finder?q=J%C3%B6nk%C3%B6ping,%20City&latitude=57.78252&longitude=14.17347&source=search', 'Öster'),
        ('Coop Atollen', 'coop.se/butiker-erbjudanden/coop/coop-atollen-jonkoping/', 'Atollen'),
        ('Coop Östra Torget', 'coop.se/butiker-erbjudanden/coop/coop-ostra-torget/', 'Öster'),
        ('Copenhagen Luxe', 'https://copenhagenluxe.dk/', 'Öster'),
        ('Day fotografi', 'dayfotografi.se/', NULL),
        ('Dinos kemtvätt', 'dinos.nu', 'Väster'),
        ('Din Sko', 'dinsko.se/stores', 'Öster'),
        ('Direkt optik', 'https://www.direktoptik.se/butiker/jonkoping/ostra-storgatan-29/', NULL),
        ('Dressman', 'dressmann.com/no/bedriftssider/finn-butikk/Sweden/Dressmann_Jonkoping/', 'Öster'),
        ('Elias Urmästare', 'facebook.com/profile.php?id=100064073112753', NULL),
        ('Engströms Urmakeri', 'engstromsurmakeri.se', NULL),
        ('Euroex', NULL, NULL),
        ('Evoke industry', NULL, NULL),
        ('Fabriken', 'butikfabriken.se', 'Atollen'),
        ('Fiction Prescription', 'https://www.instagram.com/fiction.prescription.jonkoping/', NULL),
        ('Forex Bank Väster', NULL, 'Väster'),
        ('Foten', 'https://www.foten.se/', NULL),
        ('Friendly Corner', 'https://friendlycorner.se/butiken', 'Tändsticksområdet'),
        ('Galleri 701 ramcenter', 'galleri701-ram.se', NULL),
        ('Gant', 'gant.se/stores?lat=57.78261370000001&long=14.1617876&postalCode=j%C3%B6nk%C3%B6ping&radius=10.0', 'Atollen'),
        ('Gåvan', 'gavanjonkoping.se', 'Öster'),
        ('Gina Tricot', 'ginatricot.com/se/find-store', 'Öster'),
        ('Go Banana', 'gobanana.se', 'Väster'),
        ('Godis och Tobakshörnan', NULL, 'Öster'),
        ('Golden athlete', 'goldenathlete.se/sv/butiker-2', 'Öster'),
        ('Grmawit Store', 'grmawit.com/', 'Väster'),
        ('Guldsmedjan Snarberg', 'guldsmedjan-snarberg.se', 'Väster'),
        ('Hälsokraft', 'halsokraft.se/butiker?butik=503', 'Öster'),
        ('Hemköp', 'hemkop.se/butik/4674', 'Väster'),
        ('Hemmakväll', 'hemmakvall.se/hitta-butik/', 'Öster'),
        ('Hemtex', 'hemtex.se/hitta-butik/jonkoping', 'Öster'),
        ('Hi-fi Klubben', 'hifiklubben.se/hitta-butik/jonkoping/?gclid=Cj0KCQjwhsmaBhCvARIsAIbEbH4w2ngSDzygBKQSqHVzCSFAplyrpByCMojT6dfo-Xnjcn7P9j_jBn8aAsD0EALw_wcB', 'Väster'),
        ('H&M', 'hm.com/sv_se/customer-service/shoppa-pa-hm/store-locator', 'Öster'),
        ('H&M Home', 'hm.com/sv_se/customer-service/shoppa-pa-hm/store-locator', 'Öster'),
        ('Indiska', 'indiska.com/se/butiker', 'Öster'),
        ('Jeansshoppen', 'jeansshopen.se/sv/kontakt', 'Öster'),
        ('JL Sycenter', 'jlsycenter.se/kontakta-oss/', NULL),
        ('Jönköpings antik och konsthandel', NULL, 'Väster'),
        ('Jönköpings Cigrarrimport', 'atg.se/jonkopingscigarrimport', NULL),
        ('KappAhl', 'www.kappahl.com/sv-SE/kundservice/kundservice/hitta-butik/', 'Öster'),
        ('Karin Lund Design', 'facebook.com/karinlunddesign/', NULL),
        ('Katrin Bååths Ateljé', 'https://katrinbaath.se/ateljen/', 'Tändsticksområdet'),
        ('Kicks', 'kicks.se/butiker/jonkoping-smedjegatan', 'Öster'),
        ('Kjell & Company', 'kjell.com/se/butiker/sodra-strandgatan-5', 'Öster'),
        ('Klädscoopet', 'facebook.com/Kladscoopet/', 'Öster'),
        ('KOiJ Konsthantverk', 'koij.se', 'Öster'),
        ('Kristina Brud & Fest', 'kristinabrud-fest.se', 'Väster'),
        ('Kronans Apotek Atollen', 'apoteksinfo.nu/apotek/kronans_apotek_atollen_j%C3%B6nk%C3%B6ping-1415', 'Atollen'),
        ('Kvänum Kök', 'kvanum.com/se/showrooms/jonkoping/', 'Öster'),
        ('Lagerhaus', 'lagerhaus.se/stores', 'Öster'),
        ('Lavér Studio', 'laverstudio.com/', NULL),
        ('Life Naturlig Hälsa', 'https://www.lifebutiken.se/stores', 'Väster'),
        ('Lilla Violen', 'lillaviolen.com/', 'Väster'),
        ('Lindex', 'lindex.com/se/hitta-din-butik?location=57.756066%2C14.188254&storeId=002&zoom=11', 'Öster'),
        ('Livspotential Kroppsterapi', 'facebook.com/Livspotential/', NULL),
        ('Lloyd Tabing Art Gallery', 'lloydtabingart.com/', 'Tändsticksområdet'),
        ('Macforum', 'macforum.se/butiker/forum-jonkoping', 'Öster'),
        ('MarQet', 'mq.se/butiker/?gclid=Cj0KCQjwteOaBhDuARIsADBqRejM-U3YQY9vh4F6gSXC2LnJWPVGKJ7CGfiCl1tYkREGUR37cTWMNcoaAjFGEALw_wcB', 'Öster'),
        ('Mimosa City', 'mimosacity.se', NULL),
        ('Moderna Smycken', 'klockorochsmycken.se/', 'Öster'),
        ('Naturkompaniet', 'murphysbar.se/sv/', 'Öster'),
        ('Newhouse', 'newhouse.se/newhouse/vara-butiker', 'Atollen'),
        ('New Yorker', 'newyorker.de/se/stores/', 'Öster'),
        ('Nilson Shoes', 'dinsko.se/stores', 'Öster'),
        ('Noa Noa', 'httpsfacebook.com/Noa-Noa-J%C3%B6nk%C3%B6ping-446212958766553/', 'Öster'),
        ('Nordisk Möbelkonst', 'nordiskmobelkonst.se/', 'Öster'),
        ('Normal', 'normal.se/hitta-butik/', 'Öster'),
        ('Nya Musik', 'nyamusik.se/', 'Väster'),
        ('Once for girls', 'oncestore.se/', 'Öster'),
        ('Önska', 'onska.se/vara-butiker/', 'Öster'),
        ('Optiker Jahnke', 'jahnke.se/', 'Öster'),
        ('Optiker Ullström', 'optikerullstrom.se/', 'Väster'),
        ('Optik & Form', 'optikochform.se/', NULL),
        ('Partyland', 'partyland.party/butiker/', 'Väster'),
        ('Planta Blommor', 'plantablommor.se/?gclid=Cj0KCQjwteOaBhDuARIsADBqRehsWXSRNHjeGnPn_AyambJZLmNntWxsMnUkANIHdme0NoDtc2Xi8mgaAicoEALw_wcB#.Y2p1tuzMLPZ', 'Väster'),
        ('Pleasure erotic shop', 'pleasureeroticshop.se/', 'Väster'),
        ('PMU Second Hand Jönköping City', 'pmu.se/stores/jonkopingcity/', 'Öster'),
        ('Pressbyrån Östra storgatan', 'pressbyran.se/kontakt/hitta-butik/', 'Öster'),
        ('Pressbyrån Resecentrum', 'pressbyran.se/kontakt/hitta-butik/', 'Resecentrum'),
        ('Pressbyrån Väster', 'pressbyran.se/kontakt/hitta-butik/', 'Väster'),
        ('Rabalder', 'publik.rabalder.se/butiker/joenkoeping.aspx', 'Öster'),
        ('Resehuset', 'resehuset.se/', 'Väster'),
        ('Rituals', 'rituals.com/sv-se/store-detail?store=J%C3%B6nk%C3%B6ping-%C3%96stra-Storgatan', 'Öster'),
        ('Rizzo', 'rizzo.se/stores/', 'Öster'),
        ('Röda Korset Second Hand', 'rodakorset.se/vad-vi-gor/second-hand/butiker/roda-korset-secondhand-jonkoping/?gclid=CjwKCAjwzY2bBhB6EiwAPpUpZvHzKjPuEJP8mzdhkuZYuEUoinVduEX8lEL6C0cnHq-JkG5o4XalYBoCwX8QAvD_BwE', 'Väster'),
        ('Rundquist & Zälle', 'rundquist-zalle.com', 'Väster'),
        ('Säfvers Tobak', 'facebook.com/people/S%C3%A4fvers-tobak/100049803762896/', NULL),
        ('SåIniNordeN', 'saininorden.se/', 'Öster'),
        ('Sandströms', 'sandstroms.nu/butiker/sandstroms-jonkoping', 'Öster'),
        ('Sarabello', 'facebook.com/people/SARABELLO/100054240470073/', 'Öster'),
        ('Saumas sko & nyckelservice', 'saumasskoochnyckelservice.heymo.se/', NULL),
        ('Sjöqvists skomakeri', 'sjoqvistskomakeri.se/', 'Väster'),
        ('Smålands Skinnmanufaktur', 'smalandsskinnmanufaktur.se/', 'Tändsticksområdet'),
        ('Smarteyes', 'smarteyes.se/butiker/jonkoping', NULL),
        ('Smycka Guld', 'smycka.se/store/19', NULL),
        ('Smycket', 'smycketjonkoping.se/', NULL),
        ('Specsavers', 'httpspecsavers.se/hitta-till-din-butik/jonkoping-city?utm_source=google&utm_medium=organic&utm_campaign=gmb-website&utm_content=jonkoping&y_source=1_NDA4Nzk2NjQtNzE1LWxvY2F0aW9uLndlYnNpdGU%3D', NULL),
        ('Stagelight', 'stagelight.se/', NULL),
        ('Stil', 'stilbutikerna.se/', 'Öster'),
        ('Story', 'storyjkpg.se', 'Atollen'),
        ('SunOff', 'sunoff.se/butiker/jonkoping?gclid=CjwKCAjw8JKbBhBYEiwAs3sxNy3EnUFGceeFxyJN35fymdpsg5qEWUTPj6Sx0TbNoLdwp8E6AI-I5xoC45gQAvD_BwE', 'Väster'),
        ('Synoptik', 'httpsynoptik.se/butiker/jonkoping/jonkoping-ostra-storgatan5?utm_campaign=gmb-website&utm_source=google&utm_medium=organic&utm_content=667-Jonkoping-Ostra-Storgatan-5', NULL),
        ('Synsam Jönköping Öster', 'synsam.se/optiker/synsam-j%C3%B6nk%C3%B6ping-%C3%B6ster/128', 'Öster'),
        ('Synsam Jönköping Väster', 'synsam.se/optiker/synsam-j%C3%B6nk%C3%B6ping-v%C3%A4ster/125', 'Väster'),
        ('Systembolaget', 'systembolaget.se/butiker-ombud/', 'Öster'),
        ('The Body Shop', 'thebodyshop.com/sv-se/store-details/jonkoping-smedjegatan/3801?utm_source=google&utm_medium=organic-local&utm_campaign=yext&utm_content=3801', 'Öster'),
        ('Ticket', 'ticket.se/resebutiker/jonkoping.html', NULL),
        ('Twilfit', 'shop.change.com/sv-SE', 'Öster'),
        ('Ur & Penn', 'uropenn.se/hitta-butik/', 'Öster'),
        ('Västanhem Butik', 'vastanhem.se', 'Väster'),
        ('Västra klackbaren', NULL, NULL),
        ('Vätterbygden Ankarbergs Begravningsbyrå', 'ankarbergs.se/', NULL),
        ('Vätterfisk', 'xn--vtterfisk-v2a.se/', 'Väster'),
        ('Yxhage Lås och Larm', 'yxhage.se/', NULL),
        ('Zephyr Tattoo Parlour', 'zephyrtattoo.se', 'Öster');`

        try {
            await client.query(query);
            console.log('Inserted all venues');
        } catch (err) {
            console.error('Error inserting table', err.stack);
        }
    }
}

// Start connection
connectDB();

module.exports = client;
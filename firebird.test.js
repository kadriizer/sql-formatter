import { format, expandPhrases } from 'sql-formatter';

const query = 'select * from table';
  /* `CREATE
OR ALTER PROCEDURE ACENTAVERIMLILIK (DOVIZ VARCHAR(5), BASLANGIC DATE, BITIS DATE) RETURNS (
  ACENTA VARCHAR(50),
  OZELKOD VARCHAR(20),
  SATIS DOUBLE PRECISION,
  ALISFIYAT DOUBLE PRECISION,
  KONSFIYAT DOUBLE PRECISION,
  ACENTAHAKEDIS DOUBLE PRECISION,
  AYAKBASTI DOUBLE PRECISION,
  PERSONELHAKEDIS DOUBLE PRECISION,
  EXTRA DOUBLE PRECISION,
  EXTRAYUZDE DOUBLE PRECISION,
  KAR DOUBLE PRECISION,
  KARYUZ DOUBLE PRECISION,
  ADET DOUBLE PRECISION,
  PAX DOUBLE PRECISION,
  PAXORT DOUBLE PRECISION,
  KATLAMA DOUBLE PRECISION,
  HAKEDISYUZDE DOUBLE PRECISION,
  URUNBASI DOUBLE PRECISION,
  HESAPBAKIYE DOUBLE PRECISION,
  HESAPDOVIZ VARCHAR(5),
  BORC DOUBLE PRECISION,
  ALACAK DOUBLE PRECISION,
  BAKIYE DOUBLE PRECISION,
  RAPORDOVIZI VARCHAR(5)
) AS
begin RAPORDOVIZI = :doviz;
FOR select
  (
    case
      when acenta is null then 'CARİ'
      else acenta
    end
  ) acenta,
  ozelkod,
  satis,
  alisfiyat,
  konsfiyat,
  acentahakedis,
  ayakbasti,
  personelhakedis,
  (ayakbasti + extra) extra,
  case
    when satis > 0 then ((ayakbasti + extra + urunbasi) / satis) * 100
    else 0
  end extrayuzde,
  satis - konsfiyat - (
    acentahakedis + personelhakedis + extra + ayakbasti + urunbasi
  ) as kar,
  (
    case
      when satis > 0 then (
        (
          satis - konsfiyat - (
            acentahakedis + personelhakedis + extra + ayakbasti + urunbasi
          )
        ) / satis
      ) * 100
      else 0
    end
  ) as karyuz,
  adet,
  coalesce(pax, 0) pax,
  (
    case
      when pax > 0 then satis / pax
      else 0
    end
  ) as paxort,
  case
    when konsfiyat <> 0 then satis / konsfiyat
    else 0
  end katlama,
  case
    when satis > 0 then (acentahakedis / satis) * 100
    else 0
  end hakedisyuzde,
  urunbasi,
  hesapbakiye,
  hesapdoviz,
  borc,
  alacak,
  (borc - alacak) bakiye
from
  (
    select
      acentakod,
      acenta,
      ozelkod,
      sum(satis) satis,
      sum(alisfiyat) alisfiyat,
      sum(konsfiyat) konsfiyat,
      sum(acentahakedis) acentahakedis,
      sum(personelhakedis) personelhakedis,
      sum(adet) adet,
      sum(pax) pax,
      sum(extra) extra,
      sum(ayakbasti) ayakbasti,
      sum(
        case
          when (
            acentakod = '329.01.02.01.0038'
            or acentakod = '329.01.02.01.0067'
          ) then adet * 5
          else 0
        end
      ) urunbasi,
      sum(hesapbakiye) hesapbakiye,
      hesapdoviz,
      sum(borc) borc,
      sum(alacak) alacak
    from
      (
        select
          case
            when f.acentakod is null then null
            else c.kod
          end acentakod,
          case
            when f.acentakod is null then 'CARİ'
            else c.adi
          end acenta,
          c.ozelkod,
          sum(
            (
              select
                kur
              from
                doviz_cevir (i.tarih, i.doviz, :doviz, i.birimfiyat, 0, 0)
            )
          ) as satis,
          sum(
            (
              select
                kur
              from
                doviz_cevir (s.tarih, s.alisdoviz, :doviz, s.alisfiyati, 0, 0)
            )
          ) as alisfiyat,
          sum(
            (
              select
                kur
              from
                doviz_cevir (s.tarih, s.alisdoviz, :doviz, s.maliyet2, 0, 0)
            )
          ) as konsfiyat,
          sum(
            (
              select
                kur
              from
                doviz_cevir (
                  i.tarih,
                  i.doviz,
                  :doviz,
                  (
                    i.acentahakedis + i.rehberhakedis + i.grupbaskanhakedis + i.ofishakedis + i.ozelhakedis + i.kaptanhakedis + i.magazakoordhakedis + i.bolgekoordhakedis + i.bolgesorumluhakedis
                  ),
                  0,
                  0
                )
            )
          ) as acentahakedis,
          sum(
            (
              select
                kur
              from
                doviz_cevir (
                  i.tarih,
                  i.doviz,
                  :doviz,
                  (
                    i.satici1hakedis + i.satici2hakedis + i.satici3hakedis + i.satici4hakedis + i.satici5hakedis + i.satici6hakedis
                  ),
                  0,
                  0
                )
            )
          ) as personelhakedis,
          abs(sum(i.miktar)) as adet,
          0 as pax,
          0 as extra,
          0 as ayakbasti,
          0 as hesapbakiye,
          c.doviz as hesapdoviz,
          0 as borc,
          0 as alacak
        from
          stok_islem i
          left join stok s on s.kod = i.kod
          left join satis_fis f on i.satissirano = f.sirano
          left join cari c on (
            case
              when f.acentakod is null then f.carikod
              else f.acentakod
            end
          ) = c.kod
        where
          i.satissirano is not null
          and i.islem <> 'TAM TURNE'
          and i.islem <> 'KIS.TURNE'
          and i.islem <> 'İPTAL'
          and i.tarih >= :baslangic
          and i.tarih <= :bitis
        group by
          c.kod,
          c.adi,
          c.ozelkod,
          f.acentakod,
          c.doviz
        union all
        select
          c.kod acentakod,
          c.adi as acentaadi,
          c.ozelkod,
          0 as satis,
          0 as alisfiyat,
          0 as konsfiyat,
          0 as acentahakedis,
          0 as personelhakedis,
          0 as adet,
          sum(r.pax) pax,
          0 as extra,
          sum(
            (
              select
                case
                  when girisbasi = 'H' then (
                    select
                      kur
                    from
                      doviz_cevir (r.tarih, doviz, :doviz, tutar * r.pax, 0, 0)
                  )
                  else (
                    select
                      kur
                    from
                      doviz_cevir (r.tarih, doviz, :doviz, tutar, 0, 0)
                  )
                end
              from
                ayak_basti_bul ('1', r.acentakod, r.tarih, r.ayak, r.uyruk)
            )
          ) ayakbasti,
          0 as hesapbakiye,
          c.doviz as hesapdoviz,
          0 as borc,
          0 as alacak
        from
          rezervasyon r
          left join cari c on r.acentakod = c.kod
        where
          r.tarih >= :baslangic
          and r.tarih <= :bitis
          and r.giris is not null
        group by
          c.kod,
          c.adi,
          c.ozelkod,
          c.doviz
        union all
        select
          ci.ilgikod acentakod,
          ci.ilgiadi acentaadi,
          c.ozelkod,
          0 as satis,
          0 as alisfiyat,
          0 as konsfiyat,
          0 as acentahakedis,
          0 as personelhakedis,
          0 as adet,
          0 pax,
          sum(
            (
              select
                kur
              from
                doviz_cevir (ci.valor, ci.doviz, :doviz, ci.borc, 0, 0)
            )
          ) extra,
          0 as ayakbasti,
          0 as hesapbakiye,
          c.doviz as hesapdoviz,
          0 as borc,
          0 as alacak
        from
          cari_islem ci
          left join cari c on ci.ilgikod = c.kod
        where
          ci.ilgikod is not null
          and ci.kod not starting '100'
          and c.tipi = 'ACENTA'
          and ci.kod not starting '100'
          and ci.valor >= :baslangic
          and ci.valor <= :bitis
        group by
          ci.ilgikod,
          ci.ilgiadi,
          c.ozelkod,
          c.doviz
        union all
        select
          c.kod acentakod,
          c.adi as acenta,
          c.ozelkod,
          sum(
            (
              select
                kur
              from
                doviz_cevir (i.tarih, i.doviz, :doviz, i.birimfiyat, 0, 0)
            )
          ) * -1 as satis,
          sum(
            (
              select
                kur
              from
                doviz_cevir (s.tarih, s.alisdoviz, :doviz, s.alisfiyati, 0, 0)
            )
          ) * -1 as alisfiyat,
          sum(
            (
              select
                kur
              from
                doviz_cevir (s.tarih, s.alisdoviz, :doviz, s.maliyet2, 0, 0)
            )
          ) * -1 as konsfiyat,
          sum(
            (
              select
                kur
              from
                doviz_cevir (
                  i.tarih,
                  i.doviz,
                  :doviz,
                  (
                    i.acentahakedis + i.rehberhakedis + i.grupbaskanhakedis + i.ofishakedis + i.ozelhakedis + i.kaptanhakedis + i.magazakoordhakedis + i.bolgekoordhakedis + i.bolgesorumluhakedis
                  ),
                  0,
                  0
                )
            )
          ) * -1 as acentahakedis,
          sum(
            (
              select
                kur
              from
                doviz_cevir (
                  i.tarih,
                  i.doviz,
                  :doviz,
                  (
                    i.satici1hakedis + i.satici2hakedis + i.satici3hakedis + i.satici4hakedis + i.satici5hakedis + i.satici6hakedis
                  ),
                  0,
                  0
                )
            )
          ) * -1 as personelhakedis,
          abs(sum(i.miktar)) * -1 as adet,
          0 as pax,
          0 as extra,
          0 as ayakbasti,
          0 as hesapbakiye,
          c.doviz as hesapdoviz,
          0 as borc,
          0 as alacak
        from
          stok_islem i
          left join stok s on s.kod = i.kod
          left join turne_fis tf on i.turnesirano = tf.sirano
          left join cari c on (
            case
              when tf.acentakod is null then tf.carikod
              else tf.acentakod
            end
          ) = c.kod
        where
          i.turnesirano is not null
          and i.islem <> 'İPTAL'
          and i.tarih >= :baslangic
          and i.tarih <= :bitis
        group by
          c.kod,
          c.adi,
          c.ozelkod,
          c.doviz
        union all
        select
          c.kod acentakod,
          c.adi acenta,
          c.ozelkod,
          0 as satis,
          0 as alisfiyat,
          0 as konsfiyat,
          0 as acentahakedis,
          0 as personelhakedis,
          0 as adet,
          0 as pax,
          0 as extra,
          0 as ayakbasti,
          sum(ci.dovizborc - ci.dovizalacak) hesapbakiye,
          c.doviz as hesapdoviz,
          sum(
            (
              select
                kur
              from
                doviz_cevir (ci.valor, ci.doviz, :doviz, ci.borc, 0, 0)
            )
          ) borc,
          sum(
            (
              select
                kur
              from
                doviz_cevir (ci.valor, ci.doviz, :doviz, ci.alacak, 0, 0)
            )
          ) alacak
        from
          cari_islem ci
          LEFT JOIN cari c on ci.kod = c.kod
        where
          ci.ustsirano is null
          and c.tipi = 'ACENTA'
        group by
          c.kod,
          c.adi,
          c.ozelkod,
          c.doviz
      )
    group by
      acentakod,
      acenta,
      ozelkod,
      hesapdoviz
    order by
      acenta
  )
into
  :acenta,
  :ozelkod,
  :satis,
  :alisfiyat,
  :konsfiyat,
  :acentahakedis,
  :ayakbasti,
  :personelhakedis,
  :extra,
  :extrayuzde,
  :kar,
  :karyuz,
  :adet,
  :pax,
  :paxort,
  :katlama,
  :hakedisyuzde,
  :urunbasi,
  :hesapbakiye,
  :hesapdoviz,
  :borc,
  :alacak,
  :bakiye
do
  begin suspend;
end end
` */;

const formattedQuery = format(query, { language: 'firebird' });

console.log(formattedQuery);


const rules = [
  { open: 'begin', close: 'end' },
];


//const blocks = findBlocks(query, rules);

// Blokları bulmak için yardımcı fonksiyon
function findBlocks(text, rules) {
  const tokens = text.split(/\b/);
  const stack = [];
  const blocks = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toLowerCase();

    // Açılış kelimesi mi?
    const ruleOpen = rules.find(r => r.open === t);
    if (ruleOpen) {
      stack.push({ type: ruleOpen.open, start: i, close: ruleOpen.close, children: [] });
      continue;
    }

    // Kapanış kelimesi mi?
    if (stack.length > 0 && t === stack[stack.length - 1].close) {
      const block = stack.pop();
      block.end = i;
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(block);
      } else {
        blocks.push(block);
      }
    }

    return blocks;
  }
}
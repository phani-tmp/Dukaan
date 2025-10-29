export const productSynonyms = {
  vegetables: {
    tomato: {
      english: ['tomato', 'tomatoes'],
      telugu: ['టమాటో', 'టమోటా'],
      hindi: ['tamatar', 'टमाटर'],
      aliases: ['tamato']
    },
    onion: {
      english: ['onion', 'onions'],
      telugu: ['ఉల్లిపాయ', 'ఉల్లి', 'వెంగాయం'],
      hindi: ['pyaz', 'kanda', 'प्याज'],
      aliases: ['ulli', 'ullipaya']
    },
    potato: {
      english: ['potato', 'potatoes'],
      telugu: ['బంగాళాదుంప', 'ఆలూ'],
      hindi: ['aloo', 'आलू'],
      aliases: ['bangaladumpa']
    },
    carrot: {
      english: ['carrot', 'carrots'],
      telugu: ['క్యారెట్', 'గజ్జరి'],
      hindi: ['gajar', 'गाजर'],
      aliases: ['gajjari']
    },
    cauliflower: {
      english: ['cauliflower'],
      telugu: ['కాలీఫ్లవర్', 'గోభి'],
      hindi: ['gobhi', 'phool gobhi', 'गोभी'],
      aliases: ['gobi']
    },
    cabbage: {
      english: ['cabbage'],
      telugu: ['క్యాబేజీ', 'గోసు'],
      hindi: ['patta gobhi', 'बंद गोभी'],
      aliases: ['gosu']
    },
    beans: {
      english: ['beans', 'green beans'],
      telugu: ['చిక్కుడు కాయ', 'బీన్స్'],
      hindi: ['sem', 'beans', 'सेम'],
      aliases: ['chikkudu']
    },
    ladyfinger: {
      english: ['ladyfinger', 'okra', 'bhindi'],
      telugu: ['బెండకాయ'],
      hindi: ['bhindi', 'भिंडी'],
      aliases: ['bendakaya']
    },
    brinjal: {
      english: ['brinjal', 'eggplant', 'aubergine'],
      telugu: ['వంకాయ', 'బ్రింజల్'],
      hindi: ['baingan', 'बैंगन'],
      aliases: ['vankaya']
    },
    chilli: {
      english: ['chilli', 'chili', 'green chilli'],
      telugu: ['మిరపకాయ', 'పచ్చి మిరప'],
      hindi: ['mirch', 'hari mirch', 'मिर्च'],
      aliases: ['mirapakaya']
    }
  },
  
  fruits: {
    apple: {
      english: ['apple', 'apples'],
      telugu: ['ఆపిల్', 'సేబు'],
      hindi: ['seb', 'सेब'],
      aliases: ['sebu']
    },
    banana: {
      english: ['banana', 'bananas'],
      telugu: ['అరటి పండు', 'కేళ'],
      hindi: ['kela', 'केला'],
      aliases: ['arati', 'kela']
    },
    mango: {
      english: ['mango', 'mangoes'],
      telugu: ['మామిడి కాయ', 'ఆమ్'],
      hindi: ['aam', 'आम'],
      aliases: ['mamidi']
    },
    orange: {
      english: ['orange', 'oranges'],
      telugu: ['నారింజ', 'సంతర'],
      hindi: ['santra', 'narangi', 'संतरा'],
      aliases: ['narinja']
    },
    grapes: {
      english: ['grapes', 'grape'],
      telugu: ['ద్రాక్ష', 'గ్రేప్స్'],
      hindi: ['angoor', 'अंगूर'],
      aliases: ['draksha']
    },
    pomegranate: {
      english: ['pomegranate'],
      telugu: ['దానిమ్మ పండు'],
      hindi: ['anar', 'anaar', 'अनार'],
      aliases: ['danimma']
    }
  },
  
  dairy: {
    milk: {
      english: ['milk'],
      telugu: ['పాలు', 'మిల్క్'],
      hindi: ['doodh', 'दूध'],
      aliases: ['palu']
    },
    curd: {
      english: ['curd', 'yogurt'],
      telugu: ['పెరుగు', 'దహి'],
      hindi: ['dahi', 'दही'],
      aliases: ['perugu']
    },
    butter: {
      english: ['butter'],
      telugu: ['వెన్న', 'బటర్'],
      hindi: ['makhan', 'मक्खन'],
      aliases: ['venna']
    },
    ghee: {
      english: ['ghee', 'clarified butter'],
      telugu: ['నెయ్యి'],
      hindi: ['ghee', 'घी'],
      aliases: ['neyyi']
    },
    paneer: {
      english: ['paneer', 'cottage cheese'],
      telugu: ['పన్నీర్'],
      hindi: ['paneer', 'पनीर'],
      aliases: ['panneer']
    }
  },
  
  groceries: {
    rice: {
      english: ['rice'],
      telugu: ['బియ్యం', 'అన్నం'],
      hindi: ['chawal', 'चावल'],
      aliases: ['biyyam', 'annam']
    },
    wheat: {
      english: ['wheat', 'wheat flour', 'atta'],
      telugu: ['గోధుమ', 'ఆటా'],
      hindi: ['gehun', 'atta', 'गेहूं'],
      aliases: ['godhuma']
    },
    lentils: {
      english: ['lentils', 'dal', 'pulses'],
      telugu: ['పప్పు', 'కందులు'],
      hindi: ['dal', 'दाल'],
      aliases: ['pappu', 'kandulu']
    },
    oil: {
      english: ['oil', 'cooking oil'],
      telugu: ['నూనె', 'ఆయిల్'],
      hindi: ['tel', 'तेल'],
      aliases: ['noone']
    },
    salt: {
      english: ['salt'],
      telugu: ['ఉప్పు'],
      hindi: ['namak', 'नमक'],
      aliases: ['uppu']
    },
    sugar: {
      english: ['sugar'],
      telugu: ['చక్కెర', 'పంచదార'],
      hindi: ['cheeni', 'चीनी'],
      aliases: ['chakkera', 'panchadara']
    },
    tea: {
      english: ['tea', 'tea powder'],
      telugu: ['టీ', 'తేయాకు'],
      hindi: ['chai', 'चाय'],
      aliases: ['teyaku']
    }
  }
};

export function buildProductContext(products) {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: product.discountedPrice || product.price,
    unit: product.unit || 'piece',
    teluguName: getTeluguName(product.name),
    hindiName: getHindiName(product.name),
    aliases: getAliases(product.name)
  }));
}

function getTeluguName(productName) {
  const normalized = productName.toLowerCase().trim();
  
  for (const category in productSynonyms) {
    for (const item in productSynonyms[category]) {
      const data = productSynonyms[category][item];
      if (data.english.some(e => normalized.includes(e))) {
        return data.telugu[0];
      }
    }
  }
  
  return productName;
}

function getHindiName(productName) {
  const normalized = productName.toLowerCase().trim();
  
  for (const category in productSynonyms) {
    for (const item in productSynonyms[category]) {
      const data = productSynonyms[category][item];
      if (data.english.some(e => normalized.includes(e))) {
        return data.hindi[0];
      }
    }
  }
  
  return productName;
}

function getAliases(productName) {
  const normalized = productName.toLowerCase().trim();
  
  for (const category in productSynonyms) {
    for (const item in productSynonyms[category]) {
      const data = productSynonyms[category][item];
      if (data.english.some(e => normalized.includes(e))) {
        return [...data.english, ...data.telugu, ...data.hindi, ...data.aliases];
      }
    }
  }
  
  return [productName];
}
